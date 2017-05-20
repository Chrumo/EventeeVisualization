/**
 * Statistics type enum.
 * Created by tomas on 25.2.17.
 */
angular.module('diploma').value('statisticsType', {
    "REVIEWS": 'reviews',
    "RATING": 'rating',
    "HALLS": 'halls',
    "SESSIONS": 'sessions',
    "NEWS_FEEDS": 'news_feed',
    "ALL": ['reviews', 'rating', 'halls', 'sessions', 'news_feed']
});