<?php
/**
 * WhatsAppAI®SaaS functions and definitions
 */

function whatsapp_ai_saas_enqueue_scripts() {
    // Get all files in assets folder
    $assets_dir = get_template_directory() . '/assets';
    $js_files = glob($assets_dir . '/*.js');
    $css_files = glob($assets_dir . '/*.css');

    // Enqueue JS
    if (!empty($js_files)) {
        $js_file = basename($js_files[0]);
        wp_enqueue_script(
            'whatsapp-ai-saas-js',
            get_template_directory_uri() . '/assets/' . $js_file,
            array(),
            null,
            true
        );
        // Script is a module
        add_filter('script_loader_tag', function($tag, $handle, $src) {
            if ('whatsapp-ai-saas-js' !== $handle) {
                return $tag;
            }
            return '<script type="module" src="' . esc_url($src) . '"></script>';
        }, 10, 3);
    }

    // Enqueue CSS
    if (!empty($css_files)) {
        $css_file = basename($css_files[0]);
        wp_enqueue_style(
            'whatsapp-ai-saas-css',
            get_template_directory_uri() . '/assets/' . $css_file,
            array(),
            null
        );
    }
}
add_action('wp_enqueue_scripts', 'whatsapp_ai_saas_enqueue_scripts');

// Allow SPA routing (handle 404s by redirecting to index)
function whatsapp_ai_saas_handle_404() {
    if (is_404()) {
        include(get_template_directory() . '/index.php');
        exit;
    }
}
add_action('template_redirect', 'whatsapp_ai_saas_handle_404');
?>
