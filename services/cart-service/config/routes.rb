Rails.application.routes.draw do
  resources :carts, only: [:index, :show, :create] do
    member do
      post 'items', action: :add_item
      delete 'items/:item_id', action: :remove_item
    end
  end

  get 'up' => 'rails/health#show', as: :rails_health_check
end
