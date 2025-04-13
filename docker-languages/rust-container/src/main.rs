use chrono::prelude::*;
use chrono_tz::America::Los_Angeles;

fn main() {
    println!("Hello ASL!");

    let local_time = Los_Angeles.from_utc_datetime(&Utc::now().naive_utc());
    let my_format = local_time.format("%A %B %d %Y, %I:%M %p");

    println!("{}", my_format);
}
