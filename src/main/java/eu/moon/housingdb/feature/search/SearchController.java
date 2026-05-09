package eu.moon.housingdb.feature.search;

import eu.moon.housingdb.dto.SearchDto;
import eu.moon.housingdb.dto.SearchResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @PostMapping("")
    public SearchResultDto performSearch(@RequestBody SearchDto searchDto) {
        return searchService.search(searchDto, getCurrentUserName());
    }

    @GetMapping("/suggestions")
    public List<String> getTopSuggestions(@RequestParam("search") String search) {
        if (search.isBlank()) {
            return Collections.emptyList();
        }
        return searchService.fuzzySuggestions(search);
    }

    private String getCurrentUserName() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication.getName();
    }

}
