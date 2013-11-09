Kernel.define_method :jquery do |selector|
  MrubyJs.window.jQuery(selector)
end

Kernel.define_method :window do
  MrubyJs.window
end
