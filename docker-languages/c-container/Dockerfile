FROM gcc:latest

WORKDIR /usr/src/app

COPY . .

RUN g++ -std=c++20 -o myapp main.cpp

CMD ["./myapp"]
