import pytest

from .example import (
    AnalyticsRecorder,
    EmailNotifier,
    EventHub,
    Observer,
    OrderEvent,
    OrderTracker,
    main,
)


def test_every_attached_observer_receives_each_change() -> None:
    tracker = OrderTracker()
    a, b = AnalyticsRecorder(), AnalyticsRecorder()
    tracker.attach(a)
    tracker.attach(b)
    tracker.set_status("X", "paid")
    assert a.seen == b.seen == [OrderEvent("X", "paid")]


def test_detached_observer_stops_receiving_and_detach_is_idempotent() -> None:
    tracker = OrderTracker()
    rec = AnalyticsRecorder()
    tracker.attach(rec)
    tracker.detach(rec)
    tracker.detach(rec)
    tracker.set_status("X", "paid")
    assert rec.seen == []


def test_attach_twice_notifies_once() -> None:
    tracker = OrderTracker()
    rec = AnalyticsRecorder()
    tracker.attach(rec)
    tracker.attach(rec)
    tracker.set_status("X", "paid")
    assert len(rec.seen) == 1


def test_equal_looking_observers_are_still_distinct() -> None:
    tracker = OrderTracker()
    tracker.attach(AnalyticsRecorder())
    tracker.attach(AnalyticsRecorder())
    assert len(tracker._observers) == 2


def test_no_notification_when_status_does_not_change() -> None:
    tracker = OrderTracker()
    rec = AnalyticsRecorder()
    tracker.attach(rec)
    tracker.set_status("X", "paid")
    tracker.set_status("X", "paid")
    assert len(rec.seen) == 1


def test_observer_can_detach_itself_while_being_notified() -> None:
    tracker = OrderTracker()
    after = AnalyticsRecorder()

    class OneShot(Observer):
        calls = 0

        def update(self, event: OrderEvent) -> None:
            OneShot.calls += 1
            tracker.detach(self)

    tracker.attach(OneShot())
    tracker.attach(after)
    tracker.set_status("X", "paid")
    tracker.set_status("X", "shipped")
    assert OneShot.calls == 1
    assert len(after.seen) == 2


def test_email_notifier_prints_every_status(capsys: pytest.CaptureFixture[str]) -> None:
    EmailNotifier("a@b.c").update(OrderEvent("Z", "refunded"))
    assert capsys.readouterr().out == "email a@b.c: order Z is refunded\n"


def test_event_hub_unsubscribe_function() -> None:
    hub = EventHub()
    received: list[str] = []
    unsubscribe = hub.subscribe(lambda e: received.append(e.status))
    hub.publish(OrderEvent("1", "paid"))
    unsubscribe()
    unsubscribe()
    hub.publish(OrderEvent("1", "shipped"))
    assert received == ["paid"]


def test_main_matches_expected_output(capsys: pytest.CaptureFixture[str], expected_output: str) -> None:
    main()
    assert capsys.readouterr().out == expected_output
