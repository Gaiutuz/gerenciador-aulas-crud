import os
from app import create_app, db
from app.models import LessonPlan

app = create_app(os.environ.get("FLASK_ENV", "development"))


@app.shell_context_processor
def contexto_shell():
    # Disponibiliza db e LessonPlan no shell do Flask (flask shell)
    return {"db": db, "LessonPlan": LessonPlan}


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=app.config["DEBUG"])
