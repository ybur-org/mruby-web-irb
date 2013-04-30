var history = [], history_index = 0;

(function () {
  var lines = [], printed = false, webruby, load_string_func;

  if (localStorage) {
    history = JSON.parse(localStorage.history || '[]');
    history_index = history.length;
  }

  var ENTER_KEY = 13;
  var UP_KEY    = 38;
  var DOWN_KEY  = 40;

  window.Module = {};
  window.Module['print'] = function (x) {
    lines.push(x);
    printed = true;
  };

  $(document).ready(function() {
    $(window).resize(function() {
      var $window = $(window);

      $('#shell').height($window.height()-10);
      $('#command input').width($window.width()-60);
    });

    $('#shell').click(function() {
      $('input').focus();
    });

    $(window).trigger('resize');

    webruby = new WEBRUBY({print_level: 2});
    webruby.run_source($('script[type="text/ruby"]').text());

    var command = function(source) {
      lines = [];
      printed = false;

      if (source != history[history.length-1])
        history.push(source);

      history_index = history.length;

      webruby.run_source(source);

      if (!printed) {
        window.Module['print']('nil');
      }

      add_output(source, lines);
    };

    var add_output = function(source, lines) {
      var element = $("#output");
      var value   = lines.slice(-1)[0];

      var session = element.append('<div class="session"><div class="command"><span class="prompt">&gt;&gt;</span><span class="source"/></div><div class="response"></div></div>').find('.session:last');
      var response = session.find('.response');

      $(lines.slice(0, -1)).each(function(_, line) {
        response.append('<p>');
        response.find('p:last').text(line);
      });

      session.find('.command .source').text(source);
      if (value) {
        response.append('<span class="value-prompt">=&gt;</span><span class="value" />');
        response.find('.value').text(value);
      }

      $('#container').animate({
          scrollTop: $("#output").height()
       }, 200 + lines.length*50);

      history_index = history.length;
    };

    $('#shell input').keydown(function(e) {
      var cmd, found = true;

      switch (e.which) {
        case UP_KEY:
          history_index--;
          cmd = history[history_index];

          if (history_index < 0)
            history_index = 0;
          else
            $('#shell input').val(cmd);

          break;

        case DOWN_KEY:
          history_index++;
          cmd = history[history_index];

          if (history_index >= history.length) {
            history_index = history.length-1;
            $('#shell input').val('');
          }
          else
            $('#shell input').val(cmd);

          break;

        case ENTER_KEY:
          var val = $(this).val().trim();
          if (val)
            command(val);
          else
            add_output('', []);

          $(this).val('');
          $(this).focus();
          break;

        default:
          found = false;
          break;
      }

      if (found) e.preventDefault();
    });

    window.onbeforeunload = function () {
      webruby.close();

      if (localStorage) {
        localStorage.history = JSON.stringify(history);
      }
    }
  });
}());
