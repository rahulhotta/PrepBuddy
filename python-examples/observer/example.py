"""Observer: an order tracker tells every subscribed channel when an order changes status."""

from __future__ import annotations

from abc import ABC, abstractmethod
from collections.abc import Callable
from dataclasses import dataclass, field


@dataclass(frozen=True)
class OrderEvent:
    order_id: str
    status: str


class Observer(ABC):
    @abstractmethod
    def update(self, event: OrderEvent) -> None: ...


class Subject:
    """Keeps the observer list; knows nothing about what observers do."""

    def __init__(self) -> None:
        self._observers: list[Observer] = []

    def attach(self, observer: Observer) -> None:
        if observer not in self._observers:
            self._observers.append(observer)

    def detach(self, observer: Observer) -> None:
        if observer in self._observers:
            self._observers.remove(observer)

    def notify(self, event: OrderEvent) -> None:
        # Iterate over a copy so an observer may detach itself during the loop.
        for observer in list(self._observers):
            observer.update(event)


class OrderTracker(Subject):
    def __init__(self) -> None:
        super().__init__()
        self._status: dict[str, str] = {}

    def set_status(self, order_id: str, status: str) -> None:
        if self._status.get(order_id) == status:
            return
        self._status[order_id] = status
        self.notify(OrderEvent(order_id, status))


# eq=False keeps identity semantics, so two notifiers with equal fields are still distinct observers.
@dataclass(eq=False)
class EmailNotifier(Observer):
    address: str

    def update(self, event: OrderEvent) -> None:
        print(f"email {self.address}: order {event.order_id} is {event.status}")


@dataclass(eq=False)
class SmsNotifier(Observer):
    phone: str
    statuses: frozenset[str] = frozenset({"shipped", "delivered"})

    def update(self, event: OrderEvent) -> None:
        if event.status in self.statuses:
            print(f"sms {self.phone}: order {event.order_id} {event.status}")


@dataclass(eq=False)
class AnalyticsRecorder(Observer):
    seen: list[OrderEvent] = field(default_factory=list)

    def update(self, event: OrderEvent) -> None:
        self.seen.append(event)


# Pythonic variant: observers are plain callables and subscribe() returns the way to unsubscribe.
Listener = Callable[[OrderEvent], None]


class EventHub:
    def __init__(self) -> None:
        self._listeners: list[Listener] = []

    def subscribe(self, listener: Listener) -> Callable[[], None]:
        self._listeners.append(listener)

        def unsubscribe() -> None:
            if listener in self._listeners:
                self._listeners.remove(listener)

        return unsubscribe

    def publish(self, event: OrderEvent) -> None:
        for listener in list(self._listeners):
            listener(event)


def main() -> None:
    tracker = OrderTracker()
    email = EmailNotifier("ana@example.com")
    sms = SmsNotifier("555-0100")
    analytics = AnalyticsRecorder()
    for observer in (email, sms, analytics):
        tracker.attach(observer)

    tracker.set_status("A-100", "paid")
    tracker.set_status("A-100", "shipped")
    tracker.set_status("A-100", "shipped")
    tracker.detach(email)
    tracker.set_status("A-100", "delivered")
    print(f"analytics saw {len(analytics.seen)} events")

    hub = EventHub()
    unsubscribe = hub.subscribe(lambda e: print(f"callback: {e.order_id} -> {e.status}"))
    hub.publish(OrderEvent("B-7", "paid"))
    unsubscribe()
    hub.publish(OrderEvent("B-7", "refunded"))


if __name__ == "__main__":
    main()

# Expected output:
# email ana@example.com: order A-100 is paid
# email ana@example.com: order A-100 is shipped
# sms 555-0100: order A-100 shipped
# sms 555-0100: order A-100 delivered
# analytics saw 3 events
# callback: B-7 -> paid
