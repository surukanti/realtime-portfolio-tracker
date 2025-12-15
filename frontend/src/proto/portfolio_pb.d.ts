import * as jspb from 'google-protobuf'



export class AddStockRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): AddStockRequest;

  getSymbol(): string;
  setSymbol(value: string): AddStockRequest;

  getQuantity(): number;
  setQuantity(value: number): AddStockRequest;

  getPurchasePrice(): number;
  setPurchasePrice(value: number): AddStockRequest;

  getPurchaseDate(): number;
  setPurchaseDate(value: number): AddStockRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddStockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: AddStockRequest): AddStockRequest.AsObject;
  static serializeBinaryToWriter(message: AddStockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddStockRequest;
  static deserializeBinaryFromReader(message: AddStockRequest, reader: jspb.BinaryReader): AddStockRequest;
}

export namespace AddStockRequest {
  export type AsObject = {
    userId: string,
    symbol: string,
    quantity: number,
    purchasePrice: number,
    purchaseDate: number,
  }
}

export class AddStockResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): AddStockResponse;

  getMessage(): string;
  setMessage(value: string): AddStockResponse;

  getStock(): Stock | undefined;
  setStock(value?: Stock): AddStockResponse;
  hasStock(): boolean;
  clearStock(): AddStockResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): AddStockResponse.AsObject;
  static toObject(includeInstance: boolean, msg: AddStockResponse): AddStockResponse.AsObject;
  static serializeBinaryToWriter(message: AddStockResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): AddStockResponse;
  static deserializeBinaryFromReader(message: AddStockResponse, reader: jspb.BinaryReader): AddStockResponse;
}

export namespace AddStockResponse {
  export type AsObject = {
    success: boolean,
    message: string,
    stock?: Stock.AsObject,
  }
}

export class GetPortfolioRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): GetPortfolioRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPortfolioRequest.AsObject;
  static toObject(includeInstance: boolean, msg: GetPortfolioRequest): GetPortfolioRequest.AsObject;
  static serializeBinaryToWriter(message: GetPortfolioRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPortfolioRequest;
  static deserializeBinaryFromReader(message: GetPortfolioRequest, reader: jspb.BinaryReader): GetPortfolioRequest;
}

export namespace GetPortfolioRequest {
  export type AsObject = {
    userId: string,
  }
}

export class GetPortfolioResponse extends jspb.Message {
  getStocksList(): Array<Stock>;
  setStocksList(value: Array<Stock>): GetPortfolioResponse;
  clearStocksList(): GetPortfolioResponse;
  addStocks(value?: Stock, index?: number): Stock;

  getTotalValue(): number;
  setTotalValue(value: number): GetPortfolioResponse;

  getTotalGainLoss(): number;
  setTotalGainLoss(value: number): GetPortfolioResponse;

  getTotalGainLossPercentage(): number;
  setTotalGainLossPercentage(value: number): GetPortfolioResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): GetPortfolioResponse.AsObject;
  static toObject(includeInstance: boolean, msg: GetPortfolioResponse): GetPortfolioResponse.AsObject;
  static serializeBinaryToWriter(message: GetPortfolioResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): GetPortfolioResponse;
  static deserializeBinaryFromReader(message: GetPortfolioResponse, reader: jspb.BinaryReader): GetPortfolioResponse;
}

export namespace GetPortfolioResponse {
  export type AsObject = {
    stocksList: Array<Stock.AsObject>,
    totalValue: number,
    totalGainLoss: number,
    totalGainLossPercentage: number,
  }
}

export class SetPriceAlertRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): SetPriceAlertRequest;

  getSymbol(): string;
  setSymbol(value: string): SetPriceAlertRequest;

  getTargetPrice(): number;
  setTargetPrice(value: number): SetPriceAlertRequest;

  getCondition(): AlertCondition;
  setCondition(value: AlertCondition): SetPriceAlertRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetPriceAlertRequest.AsObject;
  static toObject(includeInstance: boolean, msg: SetPriceAlertRequest): SetPriceAlertRequest.AsObject;
  static serializeBinaryToWriter(message: SetPriceAlertRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetPriceAlertRequest;
  static deserializeBinaryFromReader(message: SetPriceAlertRequest, reader: jspb.BinaryReader): SetPriceAlertRequest;
}

export namespace SetPriceAlertRequest {
  export type AsObject = {
    userId: string,
    symbol: string,
    targetPrice: number,
    condition: AlertCondition,
  }
}

export class SetPriceAlertResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): SetPriceAlertResponse;

  getMessage(): string;
  setMessage(value: string): SetPriceAlertResponse;

  getAlertId(): string;
  setAlertId(value: string): SetPriceAlertResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SetPriceAlertResponse.AsObject;
  static toObject(includeInstance: boolean, msg: SetPriceAlertResponse): SetPriceAlertResponse.AsObject;
  static serializeBinaryToWriter(message: SetPriceAlertResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SetPriceAlertResponse;
  static deserializeBinaryFromReader(message: SetPriceAlertResponse, reader: jspb.BinaryReader): SetPriceAlertResponse;
}

export namespace SetPriceAlertResponse {
  export type AsObject = {
    success: boolean,
    message: string,
    alertId: string,
  }
}

export class StreamPricesRequest extends jspb.Message {
  getSymbolsList(): Array<string>;
  setSymbolsList(value: Array<string>): StreamPricesRequest;
  clearSymbolsList(): StreamPricesRequest;
  addSymbols(value: string, index?: number): StreamPricesRequest;

  getUserId(): string;
  setUserId(value: string): StreamPricesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): StreamPricesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: StreamPricesRequest): StreamPricesRequest.AsObject;
  static serializeBinaryToWriter(message: StreamPricesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): StreamPricesRequest;
  static deserializeBinaryFromReader(message: StreamPricesRequest, reader: jspb.BinaryReader): StreamPricesRequest;
}

export namespace StreamPricesRequest {
  export type AsObject = {
    symbolsList: Array<string>,
    userId: string,
  }
}

export class PriceUpdate extends jspb.Message {
  getSymbol(): string;
  setSymbol(value: string): PriceUpdate;

  getCurrentPrice(): number;
  setCurrentPrice(value: number): PriceUpdate;

  getChange(): number;
  setChange(value: number): PriceUpdate;

  getChangePercentage(): number;
  setChangePercentage(value: number): PriceUpdate;

  getTimestamp(): number;
  setTimestamp(value: number): PriceUpdate;

  getVolume(): number;
  setVolume(value: number): PriceUpdate;

  getDayHigh(): number;
  setDayHigh(value: number): PriceUpdate;

  getDayLow(): number;
  setDayLow(value: number): PriceUpdate;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PriceUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: PriceUpdate): PriceUpdate.AsObject;
  static serializeBinaryToWriter(message: PriceUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PriceUpdate;
  static deserializeBinaryFromReader(message: PriceUpdate, reader: jspb.BinaryReader): PriceUpdate;
}

export namespace PriceUpdate {
  export type AsObject = {
    symbol: string,
    currentPrice: number,
    change: number,
    changePercentage: number,
    timestamp: number,
    volume: number,
    dayHigh: number,
    dayLow: number,
  }
}

export class PortfolioAction extends jspb.Message {
  getAction(): PortfolioAction.ActionType;
  setAction(value: PortfolioAction.ActionType): PortfolioAction;

  getSymbol(): string;
  setSymbol(value: string): PortfolioAction;

  getUserId(): string;
  setUserId(value: string): PortfolioAction;

  getAddDetails(): AddStockRequest | undefined;
  setAddDetails(value?: AddStockRequest): PortfolioAction;
  hasAddDetails(): boolean;
  clearAddDetails(): PortfolioAction;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PortfolioAction.AsObject;
  static toObject(includeInstance: boolean, msg: PortfolioAction): PortfolioAction.AsObject;
  static serializeBinaryToWriter(message: PortfolioAction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PortfolioAction;
  static deserializeBinaryFromReader(message: PortfolioAction, reader: jspb.BinaryReader): PortfolioAction;
}

export namespace PortfolioAction {
  export type AsObject = {
    action: PortfolioAction.ActionType,
    symbol: string,
    userId: string,
    addDetails?: AddStockRequest.AsObject,
  }

  export enum ActionType { 
    SUBSCRIBE = 0,
    UNSUBSCRIBE = 1,
    ADD_STOCK = 2,
    REMOVE_STOCK = 3,
  }
}

export class PortfolioUpdate extends jspb.Message {
  getType(): PortfolioUpdate.UpdateType;
  setType(value: PortfolioUpdate.UpdateType): PortfolioUpdate;

  getPriceUpdate(): PriceUpdate | undefined;
  setPriceUpdate(value?: PriceUpdate): PortfolioUpdate;
  hasPriceUpdate(): boolean;
  clearPriceUpdate(): PortfolioUpdate;

  getAlert(): Alert | undefined;
  setAlert(value?: Alert): PortfolioUpdate;
  hasAlert(): boolean;
  clearAlert(): PortfolioUpdate;

  getPortfolioSummary(): GetPortfolioResponse | undefined;
  setPortfolioSummary(value?: GetPortfolioResponse): PortfolioUpdate;
  hasPortfolioSummary(): boolean;
  clearPortfolioSummary(): PortfolioUpdate;

  getTimestamp(): number;
  setTimestamp(value: number): PortfolioUpdate;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PortfolioUpdate.AsObject;
  static toObject(includeInstance: boolean, msg: PortfolioUpdate): PortfolioUpdate.AsObject;
  static serializeBinaryToWriter(message: PortfolioUpdate, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PortfolioUpdate;
  static deserializeBinaryFromReader(message: PortfolioUpdate, reader: jspb.BinaryReader): PortfolioUpdate;
}

export namespace PortfolioUpdate {
  export type AsObject = {
    type: PortfolioUpdate.UpdateType,
    priceUpdate?: PriceUpdate.AsObject,
    alert?: Alert.AsObject,
    portfolioSummary?: GetPortfolioResponse.AsObject,
    timestamp: number,
  }

  export enum UpdateType { 
    PRICE_CHANGE = 0,
    ALERT_TRIGGERED = 1,
    PORTFOLIO_SUMMARY = 2,
  }
}

export class RemoveStockRequest extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): RemoveStockRequest;

  getStockId(): string;
  setStockId(value: string): RemoveStockRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveStockRequest.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveStockRequest): RemoveStockRequest.AsObject;
  static serializeBinaryToWriter(message: RemoveStockRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveStockRequest;
  static deserializeBinaryFromReader(message: RemoveStockRequest, reader: jspb.BinaryReader): RemoveStockRequest;
}

export namespace RemoveStockRequest {
  export type AsObject = {
    userId: string,
    stockId: string,
  }
}

export class RemoveStockResponse extends jspb.Message {
  getSuccess(): boolean;
  setSuccess(value: boolean): RemoveStockResponse;

  getMessage(): string;
  setMessage(value: string): RemoveStockResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): RemoveStockResponse.AsObject;
  static toObject(includeInstance: boolean, msg: RemoveStockResponse): RemoveStockResponse.AsObject;
  static serializeBinaryToWriter(message: RemoveStockResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): RemoveStockResponse;
  static deserializeBinaryFromReader(message: RemoveStockResponse, reader: jspb.BinaryReader): RemoveStockResponse;
}

export namespace RemoveStockResponse {
  export type AsObject = {
    success: boolean,
    message: string,
  }
}

export class HistoricalDataRequest extends jspb.Message {
  getSymbol(): string;
  setSymbol(value: string): HistoricalDataRequest;

  getStartDate(): number;
  setStartDate(value: number): HistoricalDataRequest;

  getEndDate(): number;
  setEndDate(value: number): HistoricalDataRequest;

  getInterval(): string;
  setInterval(value: string): HistoricalDataRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HistoricalDataRequest.AsObject;
  static toObject(includeInstance: boolean, msg: HistoricalDataRequest): HistoricalDataRequest.AsObject;
  static serializeBinaryToWriter(message: HistoricalDataRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HistoricalDataRequest;
  static deserializeBinaryFromReader(message: HistoricalDataRequest, reader: jspb.BinaryReader): HistoricalDataRequest;
}

export namespace HistoricalDataRequest {
  export type AsObject = {
    symbol: string,
    startDate: number,
    endDate: number,
    interval: string,
  }
}

export class HistoricalDataResponse extends jspb.Message {
  getSymbol(): string;
  setSymbol(value: string): HistoricalDataResponse;

  getPricesList(): Array<HistoricalPrice>;
  setPricesList(value: Array<HistoricalPrice>): HistoricalDataResponse;
  clearPricesList(): HistoricalDataResponse;
  addPrices(value?: HistoricalPrice, index?: number): HistoricalPrice;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HistoricalDataResponse.AsObject;
  static toObject(includeInstance: boolean, msg: HistoricalDataResponse): HistoricalDataResponse.AsObject;
  static serializeBinaryToWriter(message: HistoricalDataResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HistoricalDataResponse;
  static deserializeBinaryFromReader(message: HistoricalDataResponse, reader: jspb.BinaryReader): HistoricalDataResponse;
}

export namespace HistoricalDataResponse {
  export type AsObject = {
    symbol: string,
    pricesList: Array<HistoricalPrice.AsObject>,
  }
}

export class HistoricalPrice extends jspb.Message {
  getTimestamp(): number;
  setTimestamp(value: number): HistoricalPrice;

  getOpen(): number;
  setOpen(value: number): HistoricalPrice;

  getHigh(): number;
  setHigh(value: number): HistoricalPrice;

  getLow(): number;
  setLow(value: number): HistoricalPrice;

  getClose(): number;
  setClose(value: number): HistoricalPrice;

  getVolume(): number;
  setVolume(value: number): HistoricalPrice;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): HistoricalPrice.AsObject;
  static toObject(includeInstance: boolean, msg: HistoricalPrice): HistoricalPrice.AsObject;
  static serializeBinaryToWriter(message: HistoricalPrice, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): HistoricalPrice;
  static deserializeBinaryFromReader(message: HistoricalPrice, reader: jspb.BinaryReader): HistoricalPrice;
}

export namespace HistoricalPrice {
  export type AsObject = {
    timestamp: number,
    open: number,
    high: number,
    low: number,
    close: number,
    volume: number,
  }
}

export class Stock extends jspb.Message {
  getId(): string;
  setId(value: string): Stock;

  getSymbol(): string;
  setSymbol(value: string): Stock;

  getName(): string;
  setName(value: string): Stock;

  getQuantity(): number;
  setQuantity(value: number): Stock;

  getPurchasePrice(): number;
  setPurchasePrice(value: number): Stock;

  getCurrentPrice(): number;
  setCurrentPrice(value: number): Stock;

  getGainLoss(): number;
  setGainLoss(value: number): Stock;

  getGainLossPercentage(): number;
  setGainLossPercentage(value: number): Stock;

  getPurchaseDate(): number;
  setPurchaseDate(value: number): Stock;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Stock.AsObject;
  static toObject(includeInstance: boolean, msg: Stock): Stock.AsObject;
  static serializeBinaryToWriter(message: Stock, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Stock;
  static deserializeBinaryFromReader(message: Stock, reader: jspb.BinaryReader): Stock;
}

export namespace Stock {
  export type AsObject = {
    id: string,
    symbol: string,
    name: string,
    quantity: number,
    purchasePrice: number,
    currentPrice: number,
    gainLoss: number,
    gainLossPercentage: number,
    purchaseDate: number,
  }
}

export class Alert extends jspb.Message {
  getId(): string;
  setId(value: string): Alert;

  getSymbol(): string;
  setSymbol(value: string): Alert;

  getTargetPrice(): number;
  setTargetPrice(value: number): Alert;

  getTriggeredPrice(): number;
  setTriggeredPrice(value: number): Alert;

  getCondition(): AlertCondition;
  setCondition(value: AlertCondition): Alert;

  getCreatedAt(): number;
  setCreatedAt(value: number): Alert;

  getTriggeredAt(): number;
  setTriggeredAt(value: number): Alert;

  getIsTriggered(): boolean;
  setIsTriggered(value: boolean): Alert;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Alert.AsObject;
  static toObject(includeInstance: boolean, msg: Alert): Alert.AsObject;
  static serializeBinaryToWriter(message: Alert, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Alert;
  static deserializeBinaryFromReader(message: Alert, reader: jspb.BinaryReader): Alert;
}

export namespace Alert {
  export type AsObject = {
    id: string,
    symbol: string,
    targetPrice: number,
    triggeredPrice: number,
    condition: AlertCondition,
    createdAt: number,
    triggeredAt: number,
    isTriggered: boolean,
  }
}

export enum AlertCondition { 
  ABOVE = 0,
  BELOW = 1,
}
