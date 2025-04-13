#include <iostream>
#include <chrono>
#include <iomanip>
#include <sstream>

int main() {
	using namespace std;
	using namespace std::chrono;

	auto now = system_clock::now();
	time_t current_time = system_clock::to_time_t(now);

	stringstream formatted;
	formatted << put_time(localtime(&current_time), "%A %B %d %Y, %I:%M %p");


	 cout << "Hello ASL!" << endl;
	 cout << formatted.str() << endl;

	return 0;
}
