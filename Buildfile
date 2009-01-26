# ==========================================================================
# SproutCore JavaScript Framework - Buildfile
# copyright (c) 2009 - Apple, Inc, Sprout Systems, Inc, and contributors
# ==========================================================================

# This buildfile defines the configurations needed to link together the 
# various frameworks that make up SproutCore.  If you want to override some
# of these settings, you should make changes to your project Buildfile 
# instead.

config :all, 
  :layout         => 'sproutcore:lib/index.rhtml',
  :test_layout    => 'sproutcore:lib/test.rhtml',
  :test_required  => '/sproutcore/testing',
  :debug_required => ['/sproutcore/debug']
  
config :costello,   :required => []
config :core_query, :required => []
config :foundation, :required => [:costello]
config :datastore,  :required => [:costello]

config :desktop,    
  :required => [:costello, :datastore, :foundation, :core_query]

config :mobile,    
  :required => [:costello, :datastore, :foundation, :core_query]

config :deprecated, :required => :desktop
config :sproutcore, :required => :desktop

config :testing, 
  :required => [], :test_required => [], :debug_required => []
  
config :debug,
  :required => [], :test_required => [], :debug_required => []
