package fu.se.lms_group6.common.http;

import java.util.Set;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import fu.se.lms_group6.common.exception.BusinessException;
import fu.se.lms_group6.common.exception.ErrorCode;

public final class PageRequestFactory {
    private PageRequestFactory() {}

    public static PageRequest create(int page, int size, String sort, Set<String> allowedFields) {
        if (page < 0 || size < 1 || size > 100) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        if (sort == null || sort.isBlank()) {
            return PageRequest.of(page, size);
        }
        String[] parts = sort.split(",", -1);
        if (parts.length != 2 || !allowedFields.contains(parts[0])
                || !(parts[1].equalsIgnoreCase("asc") || parts[1].equalsIgnoreCase("desc"))) {
            throw new BusinessException(ErrorCode.INVALID_REQUEST);
        }
        return PageRequest.of(page, size, Sort.by(Sort.Direction.fromString(parts[1]), parts[0]));
    }
}
