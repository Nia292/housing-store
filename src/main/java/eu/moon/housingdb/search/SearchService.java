package eu.moon.housingdb.search;

import eu.moon.housingdb.domain.HousingTag;
import eu.moon.housingdb.dto.SearchDto;
import eu.moon.housingdb.dto.SearchResultDto;
import eu.moon.housingdb.repo.HousingPlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.search.mapper.pojo.standalone.mapping.SearchMapping;
import org.hibernate.search.mapper.pojo.standalone.session.SearchSession;
import org.hibernate.search.mapper.pojo.standalone.work.SearchIndexingPlan;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final HousingPlotRepository housingPlotRepository;
    private final SearchMapping searchMapping;

    @Transactional
    @Async
    public void buildIndex() {
        var start = System.currentTimeMillis();
        try ( var session = searchMapping.createSession() ) {
            SearchIndexingPlan searchIndexingPlan = session.indexingPlan();
            housingPlotRepository.getAllForIndex().forEach(searchIndexingPlan::addOrUpdate);
        }
        var stop = System.currentTimeMillis();
        log.info("Build index took {} ms", stop - start);
    }

    public void addToIndex(List<Long> ids) {
        try ( var session = searchMapping.createSession() ) {
            SearchIndexingPlan searchIndexingPlan = session.indexingPlan();
            housingPlotRepository.getManyForIndex(ids).forEach(searchIndexingPlan::addOrUpdate);
        }
    }

    public void addToIndex(Long id) {
        try ( var session = searchMapping.createSession() ) {
            SearchIndexingPlan searchIndexingPlan = session.indexingPlan();
            searchIndexingPlan.add(housingPlotRepository.getOneForIndex(id));
        }
    }

    public SearchResultDto search(SearchDto searchDto) {
        try ( SearchSession session = searchMapping.createSession() ) {
            var result = session.search(session.scope(SearchablePlot.class))
                    .select( f -> f.id( Long.class ) )
                    .where(f -> {
                        var and = f.and();
                        if (searchDto.getWorldId() != null) {
                            and.add(f.match().field("worldId").matching(searchDto.getWorldId()));
                        }
                        if (searchDto.getTerritoryId() != null) {
                            and.add(f.match().field("territoryId").matching(searchDto.getTerritoryId()));
                        }
                        if (searchDto.getWardNumber() != null) {
                            and.add(f.match().field("wardNumber").matching(searchDto.getWardNumber()));
                        }
                        if (StringUtils.hasText(searchDto.getOwner())) {
                            and.add(f.wildcard().field("owner").matching(searchDto.getOwner()));
                        }
                        if (StringUtils.hasText(searchDto.getGreeting())) {
                            and.add(f.wildcard().field("greeting").matching(searchDto.getGreeting()));
                        }
                        if (searchDto.isOnlyOpen()) {
                            and.add(f.match().field("open").matching(true));
                        }
                        if (searchDto.isOnlyFilled()) {
                            and.add(f.exists().field("lastUpdate"));
                        }
                        if (searchDto.isOnlyWithGreeting()) {
                            and.add(f.exists().field("greeting"));
                        }
                        for (HousingTag tag : searchDto.getTags()) {
                            and.add(f.or(
                                    f.match().field("tagA").matching(tag),
                                    f.match().field("tagB").matching(tag),
                                    f.match().field("tagC").matching(tag)
                            ));
                        }
                        return and;
                    })
                    .sort(f -> f.field("worldName").asc()
                        .then().field("territoryName").asc()
                        .then().field("wardNumber").asc()
                        .then().field("plotNumber").asc()
                    )
                    .fetch(searchDto.getPageSize() * searchDto.getPage(), searchDto.getPageSize());
            var hitCount = result.total().hitCount();
            var idsToLoad = result.hits();
            var dtos = housingPlotRepository.getDTOsByIDs(idsToLoad);
            return new SearchResultDto(
                    dtos,
                    hitCount
            );
        }
    }
}
