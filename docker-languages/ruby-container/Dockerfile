FROM ruby:3

WORKDIR /usr/src/myapp
COPY . .

RUN gem install tzinfo

CMD ["ruby", "./hello.rb"]
