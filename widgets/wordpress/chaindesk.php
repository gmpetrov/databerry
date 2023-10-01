<?php
/**
 * @package ChatbotGPT
 * @version 1.0
 * Plugin Name: ChatbotGPT
 * Plugin URI: http://wordpress.org/plugins/databerry/
 * Description: Build ChatGPT Chat Bots trained on custom data
 * Author: Chaindesk
 * Version: 1.0
 * Author URI: https://chaindesk.ai
 *
 * Text Domain: Chaindesk
 * Domain Path: /languages/
*/

if (! defined('ABSPATH')) {
    exit;
} // Exit if accessed directly

add_action('admin_menu', 'chaindesk_create_menu');

function chaindesk_create_menu()
{
    add_menu_page(__('Chaindesk Settings', 'chaindesk'), __('Chaindesk Settings', 'chaindesk'), 'administrator', __FILE__, 'chaindesk_plugin_settings_page', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjE3IiBoZWlnaHQ9IjE5NSIgdmlld0JveD0iMCAwIDIxNyAxOTUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMF83Nl8xMDkpIj4KPHBhdGggZD0iTTIxNyAxMzAuMDY3QzIxNyAxNjUuODA2IDE4Ny44NDIgMTk1IDE1MS44OTcgMTk1SDBWNjQuOTMzNEMwIDI5LjE5MzUgMjkuMTU4MiAwIDY1LjEwMyAwSDE1MS44OTdDMTUxLjk0NyAwIDE1MS45OTcgMCAxNTIuMDQ3IDBDMTg3Ljk0MiAwLjAxOTk4ODcgMjE3LjAyIDI5LjA5MzYgMjE2Ljk5IDY0LjkzMzRWMTMwLjA2N0gyMTdaTTY1LjEwMyA4Ni42NzExVjEwOC4zMzlIODYuODA0Vjg2LjY3MTFINjUuMTAzWk0xMzAuMjA2IDg2LjY3MTFWMTA4LjMzOUgxNTEuOTA3Vjg2LjY3MTFIMTMwLjIwNloiIGZpbGw9InVybCgjcGFpbnQwX2xpbmVhcl83Nl8xMDkpIi8+CjwvZz4KPGRlZnM+CjxsaW5lYXJHcmFkaWVudCBpZD0icGFpbnQwX2xpbmVhcl83Nl8xMDkiIHgxPSItMjIuMDQxMyIgeTE9Ijk3LjQ5NSIgeDI9IjIwMi41NjYiIHkyPSI5Ny40OTUiIGdyYWRpZW50VW5pdHM9InVzZXJTcGFjZU9uVXNlIj4KPHN0b3Agb2Zmc2V0PSIwLjI0IiBzdG9wLWNvbG9yPSIjNjc2NUU5Ii8+CjxzdG9wIG9mZnNldD0iMC4zNSIgc3RvcC1jb2xvcj0iIzc5NjJEQyIvPgo8c3RvcCBvZmZzZXQ9IjAuNzIiIHN0b3AtY29sb3I9IiNCQTU4QjAiLz4KPHN0b3Agb2Zmc2V0PSIwLjkiIHN0b3AtY29sb3I9IiNENDU1OUYiLz4KPC9saW5lYXJHcmFkaWVudD4KPGNsaXBQYXRoIGlkPSJjbGlwMF83Nl8xMDkiPgo8cmVjdCB3aWR0aD0iMjE3IiBoZWlnaHQ9IjE5NSIgZmlsbD0id2hpdGUiLz4KPC9jbGlwUGF0aD4KPC9kZWZzPgo8L3N2Zz4K');
    add_action('admin_init', 'chaindesk_register_plugin_settings');
    add_action('admin_init', 'chaindesk_register_plugin_onboarding');
}

function chaindesk_register_plugin_onboarding()
{
    $onboarding = get_option('chaindesk_onboarding');
    $agent_id = get_option('chaindesk_agent_id');

    if (empty($agent_id) && (empty($onboarding) || !$onboarding)) {
        update_option("chaindesk_onboarding", true);
        wp_redirect(admin_url('admin.php?page='.plugin_basename(__FILE__)));
    }
}

function chaindesk_register_plugin_settings()
{
    register_setting('chaindesk-plugin-settings-group', 'chaindesk_agent_id');
    register_setting('chaindesk-plugin-settings-group', 'chaindesk_verify');
    add_option('chaindesk_onboarding', false);
}

function chaindesk_plugin_settings_page()
{
    if (isset($_GET["agentId"]) && !empty($_GET["agentId"])) {
        $sanitized_agent_id = sanitize_text_field($_GET["agentId"]);
        update_option("chaindesk_agent_id", $sanitized_agent_id);
    }

    if (isset($_GET["chaindesk_verify"]) && !empty($_GET["chaindesk_verify"])) {
        $sanitized_verify = sanitize_text_field($_GET["chaindesk_verify"]);
        update_option("chaindesk_verify", $sanitized_verify);
    }

    $agent_id = get_option('chaindesk_agent_id');
    // echo("-------------------------->");
    // echo(get_option('siteurl'));
    // update_option("agent_id", null);

    $is_chaindesk_working = isset($agent_id) && !empty($agent_id);
    // Check if the connection is secure
    $is_secure = $_SERVER['SERVER_PORT'] == 443;

    // Construct and sanitize the different parts of the URL
    $protocol = $is_secure ? "https://" : "http://";
    $host = sanitize_text_field($_SERVER['HTTP_HOST']);
    $request_uri = sanitize_text_field($_SERVER['REQUEST_URI']);
    $http_callback = esc_url($protocol . $host . $request_uri);

    // $base_url = "http://localhost:3000";
    $base_url = "https://app.chaindesk.ai";
    $add_to_chaindesk_link = $base_url."/integrations/wordpress/config?callback=$http_callback&siteurl=".get_option('siteurl')."&agentId=".$agent_id;


    wp_enqueue_style('chaindesk-style', plugins_url('assets/style.css', __FILE__));



    if ($is_chaindesk_working) {
        ?>

  <div class="wrap chaindesk-wrap">
    <div class="chaindesk-modal">
      <h2 class="chaindesk-title"><?php _e('Connected with Chaindesk.', 'chaindesk'); ?></h2>
      <p class="chaindesk-subtitle"><?php _e('You can now use Chaindesk from your homepage.', 'chaindesk'); ?></p>

      <a class="chaindesk-button chaindesk-neutral" href="<?php echo esc_url($add_to_chaindesk_link);  ?>"><?php _e('Reconfigure', 'chaindesk'); ?></a>

      
    </div>

    <!-- <p class="chaindesk-notice"><?php _e('Loving Chaindesk <b style="color:red">♥</b> ? Rate us on the <a target="_blank" href="https://wordpress.org/support/plugin/chaindesk/reviews/?filter=5">Wordpress Plugin Directory</a>', 'chaindesk'); ?></p> -->
  </div>

  <?php
    } else {
        ?>
  <div class="wrap chaindesk-wrap">
    <div class="chaindesk-modal">
      <h2 class="chaindesk-title"><?php _e('Connect with Chaindesk', 'chaindesk'); ?></h2>
      <p class="chaindesk-subtitle"><?php _e('This link will redirect you to Chaindesk and configure your Wordpress.', 'chaindesk'); ?></p>
      <a class="chaindesk-button chaindesk" href="<?php echo esc_url($add_to_chaindesk_link); ?>"><?php _e('Connect with Chaindesk', 'chaindesk'); ?></a>
    </div>
  </div>
  <?php
    }
}

add_action('wp_head', 'chaindesk_hook_head', 1);

function chaindesk_hook_head()
{
    // Sanitize and validate the agent ID.
    $agent_id = get_option('chaindesk_agent_id');
    $agent_id = sanitize_text_field($agent_id);

    $locale = str_replace("_", "-", strtolower(get_locale()));

    if (!in_array($locale, array("pt-br", "pt-pr"))) {
        $locale = substr($locale, 0, 2);
    }

    // Check if the script is already enqueued.
    if (!empty($agent_id) && !wp_script_is($agent_id, 'enqueued')) {

        $agent_id_escaped = esc_attr($agent_id);
        $output = "<script 
            data-cfasync='false' 
            data-name='databerry-chat-bubble'
            id='$agent_id_escaped'
            src='https://cdn.jsdelivr.net/npm/@databerry/chat-bubble@latest'
        >";

        $output .= "</script>";
        
        echo $output;
    }
}
