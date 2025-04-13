import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.time.ZonedDateTime;
import java.time.ZoneId;
public class Main {
	public static void main(String[] args) {
		ZonedDateTime laTime = ZonedDateTime.now(ZoneId.of("America/Los_Angeles"));
		DateTimeFormatter formattedTime = DateTimeFormatter.ofPattern("EEEE MMMM dd yyyy, hh:mm a", Locale.US);		

	System.out.println("Hello ASL!");
	System.out.println(laTime.format(formattedTime));


	}
}
