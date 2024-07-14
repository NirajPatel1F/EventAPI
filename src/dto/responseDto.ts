import { Users } from "@prisma/client";

interface EventsRes {
    ID: number | null;
    Name: string | null;
    StartTime: Date | null;
    EndTime: Date | null;
    Users: Users[];
}

export default EventsRes;