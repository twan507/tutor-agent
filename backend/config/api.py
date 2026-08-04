from ninja import NinjaAPI

api = NinjaAPI(title="tutor-agent API", version="0.1.0")


@api.get("/healthz")
def healthz(request):
    return {"status": "ok"}
