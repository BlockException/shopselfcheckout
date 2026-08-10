FROM ruby:4.0.6-alpine
RUN apk add --no-cache build-base postgresql-dev
WORKDIR /app
COPY Gemfile .
RUN bundle install
COPY . .
EXPOSE 3001
CMD ["rails", "server", "-b", "0.0.0.0", "-p", "3001"]
