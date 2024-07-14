import { EventUsers } from "@prisma/client";
import ApiResponse from "../helper/httpHelper";
import EventRepository from "../repository/eventRepository";
import CommonHelper from "../helper/commonHelper";
import AddEventReq from "../dto/requestDto";

class EventService {
    private readonly eventRepo: EventRepository;
    constructor(eventRepo: EventRepository) {
        this.eventRepo = eventRepo;
    }

    async getAllUsers(): Promise<ApiResponse> {
        try {
            const users = await this.eventRepo.getAllUsers();
            return {
                StatusCode: 200,
                Message: 'List of all users',
                Data: users,
            };
        } catch (ex) {
            console.error('An error occurred while getting the users', ex);
            return {
                StatusCode: 500,
                Message: 'An error occurred while getting the users',
            };
        }
    }

    async addEventwithUsers(eventReq: AddEventReq): Promise<ApiResponse> {
        try {
            // Validation checks
            if (!eventReq.userIds.some((x: number) => x > 0)) {
                return { StatusCode: 400, Message: 'Please enter correct details' };
            }

            if (new Date(eventReq.startTime).getDate() !== new Date(eventReq.startTime).getDate()) {
                return { StatusCode: 400, Message: 'Event should start and end on the same day' };
            }

            if (CommonHelper.isEndTimeSmaller(new Date(eventReq.startTime), new Date(eventReq.endTime))) {
                return { StatusCode: 400, Message: 'End time should not be smaller than Start time' };
            }

            const users = await this.eventRepo.getAllUsers();
            for (const userId of eventReq.userIds) {
                if (!users.some(x => x.ID === userId)) {
                    return { StatusCode: 400, Message: `User does not exist with ID ${userId}` };
                }
            }

            for (const userId of eventReq.userIds) {
                const userEvents = await this.eventRepo.getEventsOfUser(userId);
                if (CommonHelper.meetingConflictsWithOtherMeeting(userEvents, new Date(eventReq.startTime), new Date(eventReq.endTime))) {
                    const conflictingUserName = users.find(x => x.ID === userId)?.Name || 'Unknown';
                    return {
                        StatusCode: 409,
                        Message: `One of the events of ${conflictingUserName} is conflicting with this event`,
                    };
                }
            }

            const newEvent = await this.eventRepo.addEvent(
                {
                    Name: eventReq.name,
                    StartTime: eventReq.startTime,
                    EndTime: eventReq.endTime,
                    ID: 0
                },
                eventReq.userIds
            )

            return {
                StatusCode: 201,
                Message: 'New event has been added',
                Data: newEvent,
            };
        } catch (ex) {
            console.error('An error occurred while adding new event', ex);
            return {
                StatusCode: 500,
                Message: 'An error occurred while adding new event',
            };
        }
    }

    async updateEventwithUsers(eventID: number, eventReq: AddEventReq): Promise<ApiResponse> {
        try {
            // Validation checks
            if (!eventReq.userIds.some((x: number) => x > 0) || eventID <= 0) {
                return { StatusCode: 400, Message: 'Please enter correct details' };
            }

            if (new Date(eventReq.startTime).getDate() !== new Date(eventReq.startTime).getDate()) {
                return { StatusCode: 400, Message: 'Event should start and end on the same day' };
            }

            if (CommonHelper.isEndTimeSmaller(new Date(eventReq.startTime), new Date(eventReq.endTime))) {
                return { StatusCode: 400, Message: 'End time should not be smaller than Start time' };
            }

            const eve = await this.eventRepo.getEventById(eventID);
            if (!eve) {
                return { StatusCode: 404, Message: 'Event not found' };
            }

            const users = await this.eventRepo.getAllUsers();
            for (const userId of eventReq.userIds) {
                if (!users.some(x => x.ID === userId)) {
                    return { StatusCode: 400, Message: 'User does not exist' };
                }
            }

            for (const userId of eventReq.userIds) {
                const userEvents = await this.eventRepo.getEventsOfUser(userId);
                if (CommonHelper.meetingConflictsWithOtherMeeting(userEvents.filter((x) => x.ID !== eve.ID), new Date(eventReq.startTime), new Date(eventReq.endTime))) {
                    const conflictingUserName = users.find(x => x.ID === userId)?.Name || 'Unknown';
                    return {
                        StatusCode: 409,
                        Message: `One of the events of ${conflictingUserName} is conflicting with this event`,
                    };
                }
            }

            const eventUsers: EventUsers[] = eventReq.userIds.map((userId: number) => ({
                ID: 0,
                EventID: eventID,
                UserID: userId,
            }));
            const getEventUsers: EventUsers[] = await this.eventRepo.getAllEventUsers(eventID);
            // Identify EventUsers to delete (in getEventUsers but not in eventUsers)
            const delEventUsers: EventUsers[] = getEventUsers.filter(eu => !eventUsers.some(euNew => euNew.UserID === eu.UserID));
            // Identify EventUsers to add (in eventUsers but not in getEventUsers)
            const addEventUsers: EventUsers[] = eventUsers.filter(euNew => !getEventUsers.some(eu => eu.UserID === euNew.UserID));

            const updatedEvent = await this.eventRepo.updateEvent(
                {
                    Name: eventReq.name,
                    StartTime: eventReq.startTime,
                    EndTime: eventReq.endTime,
                    ID: eve.ID
                },
                delEventUsers,
                addEventUsers
            );

            return {
                StatusCode: 200,
                Message: 'Event updated',
                Data: updatedEvent,
            };
        } catch (ex) {
            console.error('An error occurred while updating event', ex);
            return {
                StatusCode: 500,
                Message: 'An error occurred while updating event',
            };
        }
    }

    async getAllEvents(): Promise<ApiResponse> {
        try {
            const events = await this.eventRepo.getAllEvents();

            return {
                StatusCode: 200,
                Message: 'List of all events',
                Data: events,
            };
        } catch (ex) {
            console.error('An error occurred while getting the events', ex);
            return {
                StatusCode: 500,
                Message: 'An error occurred while getting the events',
            };
        }
    }

    async deleteEvent(eventID: number): Promise<ApiResponse> {
        try {
            if (eventID <= 0) {
                return { StatusCode: 400, Message: 'Please enter correct details' };
            }

            const eve = await this.eventRepo.getEventById(eventID)
            if (!eve) {
                return { StatusCode: 404, Message: 'Event not found' };
            }

            await this.eventRepo.deleteEvent(eve);

            return {
                StatusCode: 200,
                Message: 'Event Deleted',
            };
        } catch (ex) {
            console.error('An error occurred while deleting event', ex);
            return {
                StatusCode: 500,
                Message: 'An error occurred while deleting event',
            };
        }
    }
}

export default EventService;