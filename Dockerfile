FROM python:3.12.7-slim
COPY ./main.py /deploy/
COPY ./requirements.txt /deploy/
COPY ./voting_clf_soft.pkl /deploy/
COPY ./scaler.pkl /deploy/
WORKDIR /deploy/
RUN pip3 install -r requirements.txt
EXPOSE 8000
# Start the application using Gunicorn
ENTRYPOINT ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "main:app"]