'use strict';

/**
 * Various utilities for HB UI
 */
export default class HBUtil {
    constructor(config) {
        this._config = config;

        // Constants
        this.MERGED_TYPE_PRIORITIES = {
            adserver: 1,
            auction: 2,
            library: 3,
        };

        this.TIME_UNITS = [
            {
                msPerUnit: 1,
                title: 'ms',
            },
            {
                msPerUnit: 1000,
                title: 's',
            },
            {
                msPerUnit: 60 * 1000,
                title: 'm',
            },
            {
                msPerUnit: 3600 * 1000,
                title: 'h',
            },
            {
                msPerUnit: 24 * 3600 * 1000,
                title: 'd',
            },
            {
                msPerUnit: 30 * 24 * 3600 * 1000,
                title: 'mth',
            },
        ];
    }

    /**
     * Sort collapsed or original events
     */
    sortEvents(events) {
        events.sort((a, b) => {
            if (a.msStart < b.msStart) {
                return -1;
            }
            if (a.msStart > b.msStart) {
                return 1;
            }

            // msEnd
            if ((a.msEnd === null) && (b.msEnd === null)) {
                return 0;
            }
            if (a.msEnd === null) {
                return -1;
            }
            if (b.msEnd === null) {
                return 1;
            }
            if (a.msEnd < b.msEnd) {
                return -1;
            }
            if (a.msEnd > b.msEnd) {
                return 1;
            }
            return 0;
        });
    }

    /**
     * Chose the time length that we'd like to show depending on the lanes
     */
    chooseTimeLength(lanes, pf) {
        // Scan all the lanes and get the maximal msStart and maximal msEnd
        let maxMsStart = 0;
        let maxMsEnd = 0;

        // Maybe we have dom or page load events
        if (pf.msDom) {
            maxMsStart = pf.msDom;
            maxMsEnd = pf.msDom;
        }
        if (pf.msCompleted) {
            maxMsStart = Math.max(maxMsStart, pf.msCompleted);
            maxMsEnd = Math.max(maxMsEnd, pf.msCompleted);
        }

        // Scan the events
        lanes.forEach(lane => {
            lane.events.forEach(event => {
                if (maxMsStart < event.msStart) {
                    maxMsStart = event.msStart;
                }

                // Update max end only if we didn't discover that there was an uncompleted event
                if (maxMsEnd !== null) {
                    if ((event.msEnd === null) || (maxMsEnd < event.msEnd)) {
                        maxMsEnd = event.msEnd;
                    }
                }
            });
        });

        // If we have finite msEnd - then it is the time length
        if (maxMsEnd !== null) {
            return maxMsEnd;
        }

        // There were non-finished events, so just cut time length at some point after the last start time found
        const recordedLength = pf.tsmEnded - pf.tsmStarted;
        let result = Math.min(recordedLength, maxMsStart + this._config.MAX_TIME_FOR_INFINITE_EVENTS);

        if (result < this._config.MIN_SHOW_TIME) {
            result = this._config.MIN_SHOW_TIME;
        }
        return result;
    }

    /**
     * Choose the step and units to draw time ticks (milliseconds)
     */
    chooseTimeTicksStep(chartWidth, scale) {
        // How many ticks we would like to have on the scale
        let numTicks = chartWidth / this._config.TIME_TICKS_DISTANCE_GOOD;
        if (numTicks < 1) {
            numTicks = 1;
        }

        // How manu milliseconds per tick we would like to have
        const msPerTick = (chartWidth / scale) / numTicks;

        // Search area around a tick where we will be searching a whole unit (milliseconds)
        const msSearch = this._config.TIME_TICKS_DISTANCE_SEARCH / scale;

        // The minimal time where first tick is possible (milliseconds)
        const msMinTick = msPerTick - msSearch;

        // Select the unit to use
        let selected = this.TIME_UNITS[1];
        for (let i = 0; i < this.TIME_UNITS.length; i++) {
            const unit = this.TIME_UNITS[i];
            const isUnitBefore = (msMinTick - unit.msPerUnit) >= -msSearch;
            const isUnitInSearchArea = Math.abs(msPerTick - unit.msPerUnit) <= msSearch;
            if (isUnitBefore || isUnitInSearchArea) {
                selected = unit;
            }
        }

        // Now select a step according to the selected unit
        let step;
        const stepToUp = this._getMinDistance(selected.msPerUnit, msPerTick, msSearch, true);
        const stepToDown = this._getMinDistance(selected.msPerUnit, msPerTick, msSearch, false);
        if (stepToUp && !stepToDown) {
            step = stepToUp;
        } else if (!stepToUp && stepToDown) {
            step = stepToDown;
        } else if (stepToUp && stepToDown) {
            const distanceUp = Math.abs(stepToUp - msPerTick);
            const distanceDown = Math.abs(stepToDown - msPerTick);
            step = distanceUp < distanceDown ? stepToUp : stepToDown;
        } else {
            step = msPerTick;
        }

        return {
            unit: selected,
            msStep: step,
        };
    }

    /**
     * Select a minimal distance we need to go from msStart to msTarget with 2, 5 or 10 divider of the unit
     */
    _getMinDistance(msStart, msTarget, msSearch, isGoUp) {
        let result = null;
        let resultDistance = null;

        let accumulator = 1;
        let nextApply = 2; // We apply 2, 5 and 10 as multiplier and divider to search for the best suitable tick step size

        let prevDistance = null;
        for (let i = 0; i < 10000; i++) { // Watch dog to not suddenly go into an eternal loop
            const current = isGoUp
                ? msStart * accumulator
                : msStart / accumulator;
            const offset = current - msTarget;
            const distance = Math.abs(offset);

            // Check maybe we found a good distance
            const isDistanceAllowed = (distance <= msSearch) || (offset > 0);
            if (isDistanceAllowed) {
                if ((resultDistance === null) || (resultDistance > distance)) {
                    result = current;
                    resultDistance = distance;
                }
            }

            // Check maybe it's time to finish search, because we have started to go away from the target
            if ((prevDistance !== null) && (prevDistance < distance)) {
                break;
            }
            prevDistance = distance;

            // Increase the accumulator
            switch (nextApply) {
                case 2:
                    accumulator *= 2;
                    nextApply = 5;
                    break;
                case 5:
                    accumulator /= 2;
                    accumulator *= 5;
                    nextApply = 10;
                    break;
                case 10:
                    accumulator /= 5;
                    accumulator *= 10;
                    nextApply = 2;
                    break;
            }
        }

        return result;
    }

    /**
     * Return a string to represent the time mark according to the chosen units
     */
    getTimeMarkText(ms, unit) {
        const number = ms / unit.msPerUnit;
        let stNumber;
        if (number == 0) {
            stNumber = '0';
        } else if (number < 1) {
            stNumber = number.toFixed(this._getLastNonZeroFracDigit(number, 20, 2));
        } else {
            stNumber = number.toFixed(this._getLastNonZeroFracDigit(number, 2, 2));
        }
        return stNumber + unit.title;
    }

    /**
     * Return the last non-zero digit after the comma, searching up to max digits.
     * The result is 1-based.
     */
    _getLastNonZeroFracDigit(number, max, maxAfterFound) {
        let result = 0;
        let current = number - Math.floor(number);
        let foundAlready = false;
        for (let i = 1; i <= max; i++) {
            current *= 10;
            const digit = Math.floor(current);
            if (digit) {
                if (!foundAlready) {
                    foundAlready = true;
                    max = i + maxAfterFound - 1;
                }
                result = i;
            }
            current -= digit;
        }

        return result;
    }

    /**
     * Analyze the events in the lane, return the events to render in the collapsed state.
     */
    pfEvents2CollapsedEvents(pfEvents) {
        const result = [];

        // Scan each of pfEvents and find the place where it should be inserted
        pfEvents.forEach(pfEvent => {
            const event = this._createCollapsedEvent(pfEvent);

            // Find the position, where the event should be inserted
            let position = result.length;
            for (let i = 0; i < result.length; i++) {
                const currEvent = result[i];

                // Check whether the event starts before this event
                const startsBefore = event.msStart < currEvent.msStart;

                // Check whether the events overlay
                const overlays = this._eventsOverlay(event, currEvent);

                // If the event starts before, and there's no overlaying, then we have found the position
                if (startsBefore && !overlays) {
                    position = i;
                    break;
                }

                // If the event starts after, and there's no overlaying, then just continue checking next events
                if (!startsBefore && !overlays) {
                    continue;
                }

                // There's overlaying - merge with the current event, and check the subsequent events to be merged
                this._mergeCollapsedEvent(event, currEvent);

                const nextEvents = result.splice(i + 1);
                nextEvents.forEach(nextEvent => {
                    if (this._eventsOverlay(currEvent, nextEvent)) {
                        this._mergeCollapsedEvent(nextEvent, currEvent);
                    } else {
                        result.push(nextEvent);
                    }
                });

                // We've merged the event, so finish searching
                position = null;
                break;
            }

            // If we have the position - then insert the event
            if (position !== null) {
                result.splice(position, 0, event);
            }
        });

        // Fill the additional event properties depending on what they contain
        this._fillEventProperties(result);

        // Sort the events
        this.sortEvents(result);

        // Sort the events' events
        result.forEach(event => {
            this.sortEvents(event.events);
        });

        return result;
    }

    /**
     * Whether two events overlay each other
     */
    _eventsOverlay(a, b) {
        const overlaysLeft = (a.msStart <= b.msStart)
            && ((a.msEnd === null) || (a.msEnd >= b.msStart));
        const overlaysRight = (a.msStart >= b.msStart)
            && ((b.msEnd === null) || (a.msStart <= b.msEnd));
        return overlaysLeft || overlaysRight;
    }

    /**
     * Take a collapsed event and merge it into another collapsed event
     */
    _mergeCollapsedEvent(source, dest) {
        dest.msStart = Math.min(dest.msStart, source.msStart);
        dest.msEnd = (dest.msEnd !== null && source.msEnd !== null)
            ? Math.max(dest.msEnd, source.msEnd)
            : null;
        dest.events = dest.events.concat(source.events);
    }

    /**
     * Create collapsed event and fill it with the data from a normal event
     */
    _createCollapsedEvent(pfEvent) {
        return {
            msStart: pfEvent.msStart,
            msEnd: pfEvent.msEnd,
            mergedType: null,
            hasFailure: false,
            stFailureReasons: [],
            events: [pfEvent],
        };
    }

    /**
     * Fill the collapsed events' properties based on what they contain in their events
     */
    _fillEventProperties(cEvents) {
        cEvents.forEach(cEvent => {
            cEvent.events.forEach(event => {
                // Failure
                if (event.isFailure) {
                    cEvent.hasFailure = true;
                    cEvent.stFailureReasons.push(event.stFailureReason);
                }

                // Merged type
                if (!cEvent.mergedType) {
                    cEvent.mergedType = event.type;
                } else {
                    const currPriority = this.MERGED_TYPE_PRIORITIES[cEvent.mergedType];
                    const candidatePriority = this.MERGED_TYPE_PRIORITIES[event.type];
                    if (candidatePriority < currPriority) {
                        cEvent.mergedType = event.type;
                    }
                }
            });
        });
    }
}
