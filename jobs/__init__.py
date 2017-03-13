import eventlet, sqlalchemy
eventlet.monkey_patch()

db = sqlalchemy.create_engine('postgres://localhost:5432/jobpig')
meta = sqlalchemy.MetaData(bind=db, reflect=True)