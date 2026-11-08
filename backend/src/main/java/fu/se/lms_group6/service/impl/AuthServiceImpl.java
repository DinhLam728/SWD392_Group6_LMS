package fu.se.lms_group6.service.impl;

import fu.se.lms_group6.common.exception.BadRequestException;
import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ConflictException;
import fu.se.lms_group6.common.exception.ErrorCode;
import fu.se.lms_group6.common.exception.NotFoundException;
import fu.se.lms_group6.dto.auth.AuthResponse;
import fu.se.lms_group6.dto.auth.ForgotPasswordRequest;
import fu.se.lms_group6.dto.auth.GoogleLoginRequest;
import fu.se.lms_group6.dto.auth.LoginRequest;
import fu.se.lms_group6.dto.auth.RegisterRequest;
import fu.se.lms_group6.dto.auth.ResendOtpRequest;
import fu.se.lms_group6.dto.auth.ResetPasswordRequest;
import fu.se.lms_group6.dto.auth.UserResponse;
import fu.se.lms_group6.dto.auth.ValidateResetOtpRequest;
import fu.se.lms_group6.dto.auth.VerifyOtpRequest;
import fu.se.lms_group6.entity.enums.UserRole;
import fu.se.lms_group6.entity.User;
import fu.se.lms_group6.entity.enums.UserStatus;
import fu.se.lms_group6.externalclient.google.GoogleAuthClient;
import fu.se.lms_group6.externalclient.google.GoogleUserInfo;
import fu.se.lms_group6.repository.UserRepository;
import fu.se.lms_group6.security.JwtService;
import fu.se.lms_group6.service.AuthService;
import fu.se.lms_group6.service.EmailService;
import fu.se.lms_group6.service.OtpService;
import java.util.Optional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final OtpService otpService;
    private final EmailService emailService;
    private final GoogleAuthClient googleAuthClient;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           OtpService otpService,
                           EmailService emailService,
                           GoogleAuthClient googleAuthClient) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.emailService = emailService;
        this.googleAuthClient = googleAuthClient;
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = User.builder()
                .fullName(request.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(request.password()))
                .role(request.role())
                .status(UserStatus.PENDING)
                .build();

        User savedUser = userRepository.save(user);

        String otpCode = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otpCode);

        return mapToUserResponse(savedUser);
    }

    @Override
    @Transactional
    public UserResponse verifyAccount(VerifyOtpRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(NotFoundException::new);

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException(ErrorCode.ACCOUNT_ALREADY_ACTIVATED);
        }

        boolean isValid = otpService.validateOtp(email, request.otp());
        if (!isValid) {
            throw new BadRequestException(ErrorCode.INVALID_OTP);
        }

        user.setStatus(UserStatus.ACTIVE);
        otpService.clearOtp(email);
        User updatedUser = userRepository.save(user);

        return mapToUserResponse(updatedUser);
    }

    @Override
    public void resendOtp(ResendOtpRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(NotFoundException::new);

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new BadRequestException(ErrorCode.ACCOUNT_ALREADY_ACTIVATED);
        }

        String otpCode = otpService.generateOtp(email);
        emailService.sendOtpEmail(email, otpCode);
    }

    @Override
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND));

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        String otpCode = otpService.generateOtp(email);
        emailService.sendResetPasswordEmail(email, otpCode);
    }

    @Override
    public void validateResetOtp(ValidateResetOtpRequest request) {
        String email = request.email().trim().toLowerCase();
        boolean isValid = otpService.validateOtp(email, request.otp());
        if (!isValid) {
            throw new BadRequestException(ErrorCode.INVALID_OTP);
        }
    }

    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException(ErrorCode.NOT_FOUND));

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        boolean isValid = otpService.validateOtp(email, request.otp());
        if (!isValid) {
            throw new BadRequestException(ErrorCode.INVALID_OTP);
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        otpService.clearOtp(email);
        userRepository.save(user);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_CREDENTIALS));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BusinessException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        if (user.getStatus() == UserStatus.PENDING) {
            throw new BusinessException(ErrorCode.ACCOUNT_NOT_ACTIVATED);
        }

        String token = jwtService.generateToken(user.getUserId(), user.getEmail(), user.getRole().name());
        return AuthResponse.of(token, mapToUserResponse(user));
    }

    @Override
    @Transactional
    public AuthResponse loginWithGoogle(GoogleLoginRequest request) {
        GoogleUserInfo googleUser = googleAuthClient.verifyIdToken(request.idToken());

        String email = googleUser.email().trim().toLowerCase();
        Optional<User> existingUserOpt = userRepository.findByGoogleId(googleUser.sub());

        User user;
        if (existingUserOpt.isPresent()) {
            user = existingUserOpt.get();
        } else {
            Optional<User> byEmailOpt = userRepository.findByEmail(email);
            if (byEmailOpt.isPresent()) {
                user = byEmailOpt.get();
                user.setGoogleId(googleUser.sub());
                if (user.getStatus() == UserStatus.PENDING) {
                    user.setStatus(UserStatus.ACTIVE);
                }
                user = userRepository.save(user);
            } else {
                user = User.builder()
                        .fullName(googleUser.name())
                        .email(email)
                        .googleId(googleUser.sub())
                        .role(UserRole.STUDENT)
                        .status(UserStatus.ACTIVE)
                        .build();
                user = userRepository.save(user);
            }
        }

        if (user.getStatus() == UserStatus.LOCKED) {
            throw new BusinessException(ErrorCode.ACCOUNT_LOCKED);
        }

        String token = jwtService.generateToken(user.getUserId(), user.getEmail(), user.getRole().name());
        return AuthResponse.of(token, mapToUserResponse(user));
    }

    private UserResponse mapToUserResponse(User user) {
        return new UserResponse(
                user.getUserId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                user.getStatus()
        );
    }
}
