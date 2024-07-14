interface AddEventReq {
    name: string;
    startTime: Date;
    endTime: Date;
    userIds: number[];
}

export default AddEventReq;