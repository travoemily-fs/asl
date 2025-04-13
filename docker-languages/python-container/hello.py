import datetime
import pytz

x = datetime.datetime.now(pytz.timezone('America/Los_Angeles'))
print("Hello ASL!")
print(x.strftime("%A %B %d %Y, %I:%M %p"))
