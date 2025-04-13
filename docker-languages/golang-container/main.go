package main

import (
	"fmt"
	"time"
	"log"
)

func main() {
	location, err := time.LoadLocation("America/Los_Angeles")
	if err != nil {
		log.Fatal(err)
}

	laTime := time.Now().In(location)
	


	fmt.Println("Hello ASL!")
	fmt.Println(laTime.Format("Monday January 3 2006, 3:04 PM"))

}
