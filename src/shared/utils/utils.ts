import { Paginated, PagingDTO } from "@shared/model";
import { Response } from "express";

const successResponse = (data: any, res: Response) => {
  res.status(200).json({ data });
};

const pagingResponse = (data: any, paging: PagingDTO, filter: any, res: Response) => {
  res.status(200).json({ data, paging, filter });
};

const paginatedResponse = (paginated: Paginated<any>, filter: any, res: Response) => {
  res.status(200).json({ data: paginated.data, paging: paginated.paging, total: paginated.total, filter });
};

export { paginatedResponse, pagingResponse, successResponse };

