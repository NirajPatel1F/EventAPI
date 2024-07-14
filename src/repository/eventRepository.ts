import { Events, EventUsers, Prisma, PrismaClient, Users } from '@prisma/client';
import EventsRes from '../dto/responseDto';

class EventRepository {
    private readonly prisma: PrismaClient;
    constructor(_prisma: PrismaClient) {
        this.prisma = _prisma
    }

    async getAllUsers(): Promise<Users[]> {
        return this.prisma.users.findMany();
    }

    async getEventById(eventID: number): Promise<Events | null> {
        return this.prisma.events.findUnique({
            where: { ID: eventID },
        });
    }

    async addEvent(eve: Events, userIds: number[]): Promise<Events> {
        const event = await this.prisma.events.create({
            data: {
                Name: eve.Name,
                StartTime: eve.StartTime,
                EndTime: eve.EndTime,
                EventUsers: {
                    create: userIds.map((id) => {
                        return {
                            Users: {
                                connect: {
                                    ID: id
                                }
                            }
                        }
                    })
                },
            },
        });

        return event;
    }

    async updateEvent(
        eve: Events,
        delEventUsers: EventUsers[],
        addEventUsers: EventUsers[]
    ): Promise<Events> {
        const updatedEvent = await this.prisma.events.update({
            where: { ID: eve.ID },
            data: {
                Name: eve.Name,
                StartTime: eve.StartTime,
                EndTime: eve.EndTime,
                // any other properties from `eve` you want to update
                EventUsers: {
                    deleteMany: delEventUsers.map((eu) => ({ ID: eu.ID })),
                    create: addEventUsers.map((eu) => {
                        return {
                            Users: {
                                connect: {
                                    ID: eu.UserID ?? 0
                                }
                            }
                        }
                    })
                },
            },
        });

        return updatedEvent;
    }

    async getAllEventUsers(eventID: number): Promise<EventUsers[]> {
        return this.prisma.eventUsers.findMany({
            where: { EventID: eventID },
        });
    }

    async getAllEvents(): Promise<EventsRes[]> {
        const events = await this.prisma.events.findMany({
            include: {
                EventUsers: {
                    include: {
                        Users: true
                    }
                },
            },
        });

        return events.map((event) => ({
            ID: event.ID,
            Name: event.Name,
            StartTime: event.StartTime,
            EndTime: event.EndTime,
            Users: event.EventUsers.map((user) => ({
                ID: user.Users?.ID ?? 0,
                Name: user.Users?.Name ?? '',
                Email: user.Users?.Email ?? null,
            })),
        }));
    }

    async deleteEvent(eve: Events): Promise<void> {
        await this.prisma.eventUsers.deleteMany({
            where: { EventID: eve.ID },
        });

        await this.prisma.events.delete({
            where: { ID: eve.ID },
        });
    }

    async getEventsOfUser(userId: number): Promise<Events[]> {
        return this.prisma.events.findMany({
            where: {
                EventUsers: {
                    some: {
                        UserID: userId,
                    },
                },
            },
        });
    }
}

export default EventRepository
