#!/usr/bin/env ruby
# One-off: adds ios/GoogleService-Info.plist to the Xcode project as a
# bundled resource of the main app target. Safe to re-run (no-ops if the
# file reference already exists).
require 'xcodeproj'

project_path = File.join(__dir__, '..', 'ios', 'InstaffCustomerApp.xcodeproj')
project = Xcodeproj::Project.open(project_path)

target = project.targets.find { |t| t.name == 'InstaffCustomerApp' }
raise "Target not found" unless target

group = project.main_group.find_subpath('InstaffCustomerApp', true)
file_name = 'GoogleService-Info.plist'

existing = group.files.find { |f| f.display_name == file_name }
if existing
  puts "#{file_name} is already in the project."
else
  file_ref = group.new_reference(file_name)
  target.add_resources([file_ref])
  project.save
  puts "Added #{file_name} to target #{target.name}."
end
