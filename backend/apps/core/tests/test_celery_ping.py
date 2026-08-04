from config.celery import ping


def test_ping_task_returns_pong():
    result = ping.apply()
    assert result.successful()
    assert result.get() == "pong"
