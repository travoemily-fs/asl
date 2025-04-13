require 'date'
require 'tzinfo'

tz = TZInfo::Timezone.get('America/Los_Angeles')
time = tz.to_local(Time.now)

puts "Hello ASL!"
puts time.strftime("%A %B %d %Y, %I:%M %p")
