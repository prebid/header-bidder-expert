'use strict';

export default {
    // Num characters of the shown url when we start cutting it and adding ellipsis to the end
    CUT_URL_LENGTH: 70,

    // Show only this part of the event (milliseconds), when the event was not finished and the df completed long after that
    MAX_TIME_FOR_INFINITE_EVENTS: 5000,

    // Minimal time to render (milliseconds)
    MIN_SHOW_TIME: 1500,

    // Minimal width of a rendered lane (pixels)
    MIN_LANE_WIDTH: 300,

    // Maximal suggested width of a rendered uncollapsed event (pixels) - merely to calculate minimal zoom level
    MAX_UNC_EVENT_WIDTH: 100,

    // Maximal suggested width (pixels) - to calculate minimal zoom level
    MAX_CHART_WIDTH: 1000000,

    // Pixels per millisecond with zoom level 1
    ZOOM_LEVEL_0: 128,

    // Padding for the events from right border of the chart (pixels)
    CHART_PADDING_RIGHT: 30,

    // Height of the lanes in collapsed state (pixels)
    LANE_COLLAPSED_HEIGHT: 40,

    // Vertical margin among the events rendered in uncollapsed state (pixels)
    LANE_UNCOLLAPSED_EVENTS_MARGIN: 5,

    // Height of the events (pixels)
    EVENT_HEIGHT: 17,

    // Dashing style
    EVENT_DASHED: [7, 7],

    // The recommended distance between time measure ticks (pixels)
    TIME_TICKS_DISTANCE_GOOD: 200,

    // The distance between time measure ticks to search for whole units (pixels)
    TIME_TICKS_DISTANCE_SEARCH: 50,

    // Minimal padding to right border, when we should render time tick (pixels)
    TIME_TICKS_DISTANCE_MIN_TO_RIGHT: 80,

    // Top offset for the moment event lines (pixels)
    MOMENT_TOP_OFFSET: -10,
};
