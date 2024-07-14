import ApiResponse from "../helper/httpHelper";
import EventService from "../service/eventService";
import { NextFunction, Request, Response } from 'express';

class EventController {
    private readonly eventService: EventService;

    constructor(eventService: EventService) { // Better, inject via constructor
        this.eventService = eventService;
    }

    async GetAllUsers(_: Request, res: Response): Promise<void> {
        const apiResponse: ApiResponse = await this.eventService.getAllUsers();
        res.status(apiResponse.StatusCode).json(apiResponse);
    };

    async AddEventwithUsers(req: Request, res: Response): Promise<void> {
        const apiResponse: ApiResponse = await this.eventService.addEventwithUsers(req.body);
        res.status(apiResponse.StatusCode).json(apiResponse);
    };

    async UpdateEventwithUsers(req: Request, res: Response): Promise<void> {
        const apiResponse: ApiResponse = await this.eventService.updateEventwithUsers(Number(req.params.id), req.body);
        res.status(apiResponse.StatusCode).json(apiResponse);
    };

    async DeleteEvent(req: Request, res: Response): Promise<void> {
        const apiResponse: ApiResponse = await this.eventService.deleteEvent(Number(req.params.id));
        res.status(apiResponse.StatusCode).json(apiResponse);
    };

    async GetAllEvents(_: Request, res: Response): Promise<void> {
        const apiResponse: ApiResponse = await this.eventService.getAllEvents();
        res.status(apiResponse.StatusCode).json(apiResponse);
    };
}

export default EventController;