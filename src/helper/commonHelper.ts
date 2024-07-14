import { Events } from "@prisma/client";

class CommonHelper {
    static isEndTimeSmaller(startTime: Date, endTime: Date): boolean {
        if (endTime.getTime() <= startTime.getTime()) {
            return true;
        }
        else {
            return false;
        }
    }

    static meetingConflictsWithOtherMeeting(userEvents: Events[], startTime: Date, endTime: Date) {
        return userEvents.some(e => {
            var startsInOtherEvent = startTime >= new Date(e.StartTime ?? startTime) && startTime <= new Date(e.EndTime ?? startTime);
            var endsInOtherEvent = endTime >= new Date(e.StartTime ?? endTime) && endTime <= new Date(e.EndTime ?? endTime);

            return startsInOtherEvent || endsInOtherEvent;
        });
    }
}

export default CommonHelper