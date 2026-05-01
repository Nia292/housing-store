package eu.moon.housingdb.search;

import lombok.RequiredArgsConstructor;
import org.hibernate.search.engine.search.predicate.SearchPredicate;
import org.hibernate.search.engine.search.predicate.dsl.TypedSearchPredicateFactory;

public abstract class SearchToken {

    public abstract SearchPredicate toPredicate(TypedSearchPredicateFactory<?> factory);

    public static SearchToken tokenize(String value) {
        if (!value.contains(":")) {
            return new PhraseToken(value);
        }
        String[] split = value.split(":");
        if (split.length != 2) {
            throw new RuntimeException("Invalid search value: " + value);
        }
        var tokenKey = split[0].trim();
        var tokenValue = split[1].trim();
        return switch (tokenKey) {
            case "owner" -> new OwnerToken(tokenValue);
            case "not" -> new NotPhraseToken(tokenValue);
            case "status" -> new StatusToken(tokenValue);
            case "ward" -> new WardToken(tokenValue);
            case "plot" -> new PlotToken(tokenValue);
            default -> throw new RuntimeException("Unknown token key: " + tokenKey);
        };
    }

    @RequiredArgsConstructor
    private static class StatusToken extends SearchToken {
        private final String status;

        @Override
        public SearchPredicate toPredicate(TypedSearchPredicateFactory<?> factory) {
            return switch (status) {
                case "collected" -> factory.exists().field("lastUpdate").toPredicate();
                case "open" -> factory.match().field("open").matching(true).toPredicate();
                case "closed" -> factory.match().field("open").matching(false).toPredicate();
                case "collected-greeting'" -> factory.exists().field("greeting").toPredicate();
                default -> throw new RuntimeException("Unknown status: " + status);
            };
        }
    }

    @RequiredArgsConstructor
    private static class PlotToken extends SearchToken {
        private final String plot;

        @Override
        public SearchPredicate toPredicate(TypedSearchPredicateFactory<?> factory) {
            return factory.match().field("plotNumber").matching(Integer.parseInt(plot) - 1).toPredicate();
        }
    }

    @RequiredArgsConstructor
    private static class WardToken extends SearchToken {
        private final String ward;

        @Override
        public SearchPredicate toPredicate(TypedSearchPredicateFactory<?> factory) {
            return factory.match().field("wardNumber").matching(Integer.parseInt(ward) - 1).toPredicate();
        }
    }


    @RequiredArgsConstructor
    private static class OwnerToken extends SearchToken {
        private final String owner;

        @Override
        public SearchPredicate toPredicate(TypedSearchPredicateFactory<?> factory) {
            return factory.match().field("owner").matching(owner).toPredicate();
        }
    }

    @RequiredArgsConstructor
    private static class NotPhraseToken extends SearchToken {
        private final String value;

        @Override
        public SearchPredicate toPredicate(TypedSearchPredicateFactory<?> factory) {
            return factory.not(factory.phrase().field("greeting").matching(value).toPredicate()).toPredicate();
        }
    }

    @RequiredArgsConstructor
    private static class PhraseToken extends SearchToken {

        private final String value;


        @Override
        public SearchPredicate toPredicate(TypedSearchPredicateFactory<?> factory) {
            return factory.phrase().field("greeting").matching(value).toPredicate();
        }
    }
}
