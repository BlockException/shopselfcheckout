require_relative "boot"

require "rails"
require "action_controller/railtie"
require "action_controller/api"

Bundler.require(*Rails.groups)
require "mongoid"
require "mongoid/railtie"

module AldiCartService
  class Application < Rails::Application
    config.load_defaults 7.1
    config.api_only = true

    # Persistence is handled by Mongoid, not ActiveRecord.
    config.generators do |g|
      g.orm :mongoid
    end
  end
end
