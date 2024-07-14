import { Router } from 'express';
import EventController from '../controller/eventController';
import EventService from '../service/eventService';
import EventRepository from '../repository/eventRepository';
import { PrismaClient } from '@prisma/client';

const router = Router();

const prismaClinet = new PrismaClient();
const eventRepository = new EventRepository(prismaClinet);
const eventService = new EventService(eventRepository);
const eventController = new EventController(eventService);

router.get('/GetAllUsers', (req, res) => eventController.GetAllUsers(req, res));
router.post('/UpdateEventwithUsers/:id', (req, res) => eventController.UpdateEventwithUsers(req, res));
router.post('/AddEventwithUsers', (req, res) => eventController.AddEventwithUsers(req, res));
router.get('/DeleteEvent/:id', (req, res) => eventController.DeleteEvent(req, res));
router.get('/GetAllEvents', (req, res) => eventController.GetAllEvents(req, res));

export default router;