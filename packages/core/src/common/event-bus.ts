import { ResultAsync, okAsync } from "neverthrow";

import { coreError } from "./core-error";

import type { CoreError } from "./core-error";

export type IntegrationEvent = {
  readonly type: string;
  readonly occurredAt: string;
  readonly payload: unknown;
};

export type IntegrationEventHandler<TEvent extends IntegrationEvent> = (
  event: TEvent,
) => ResultAsync<void, CoreError>;

export type EventBus = {
  readonly publish: (event: IntegrationEvent) => ResultAsync<void, CoreError>;
  readonly subscribe: <TEvent extends IntegrationEvent>(
    type: TEvent["type"],
    handler: IntegrationEventHandler<TEvent>,
  ) => ResultAsync<void, CoreError>;
};

export function createInMemoryEventBus(): EventBus {
  const handlersByType = new Map<
    string,
    Array<IntegrationEventHandler<IntegrationEvent>>
  >();

  return {
    publish(event) {
      const handlers = handlersByType.get(event.type) ?? [];
      const results = handlers.map((handler) => handler(event));
      return ResultAsync.combine(results).map(() => undefined);
    },
    subscribe(type, handler) {
      const handlers = handlersByType.get(type) ?? [];
      handlersByType.set(type, [...handlers, handler as never]);
      return okAsync(undefined);
    },
  };
}

export function invalidEventTypeError(type: string): CoreError {
  return coreError({
    code: "EVENT_TYPE_INVALID",
    message: "이벤트 타입이 올바르지 않습니다.",
    details: { type },
  });
}
