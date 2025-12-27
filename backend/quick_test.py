try:
    print("Testing main.py import...")
    from main import app
    print("SUCCESS!")
    print(f"App: {app}")
    routes = [r.path for r in app.routes if hasattr(r, 'path')]
    print(f"Routes: {routes}")
except Exception as e:
    print(f"FAILED: {e}")
    import traceback
    traceback.print_exc()
