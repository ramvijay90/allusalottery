<?php
/*
Plugin Name: Custom Menu Dropdown
Description: A custom plugin to display a menu dropdown with sub-menu options.
Version: 1.2
Author: Your Name
*/

// The main function to display the dropdown menu and sub-menu
function custom_menu_dropdown() {
    global $wp;
    // The menu ID you want to load
    $menu_id = 198;

    // Get the menu items
    $menu_items = wp_get_nav_menu_items($menu_id);

    // Get the current page URL
    $current_url = home_url(add_query_arg(array(), $wp->request));

    // Initialize variables to store the current menu and sub-menu items
    $current_main_menu = null;
    $current_sub_menu = null;

    // Find the current menu and sub-menu items based on the current URL
    foreach ($menu_items as $item) {
        if (untrailingslashit($item->url) === untrailingslashit($current_url)) {
            if ($item->menu_item_parent == 0) {
                $current_main_menu = $item;
            } else {
                $current_sub_menu = $item;
                foreach ($menu_items as $parent_item) {
                    if ($parent_item->ID == $item->menu_item_parent) {
                        $current_main_menu = $parent_item;
                        break;
                    }
                }
            }
            break;
        }
    }

    // Start the HTML output
    ob_start();
    ?>
    <style>
        /* CSS to fix dropdown size and alignment */
        #menu-dropdown {
            display: inline-block;
        }
        #main-menu, #sub-menu {
            width: 200px; /* Adjust width as needed */
            outline: 2px solid #482d70; /* Apply outline */
            background-color: #fff; /* Apply background color */
            margin-top: 20px; /* Adjust margin-top */
            box-shadow: 0 0 20px rgba(0, 0, 0, .4); /* Apply box shadow */
        }
        .main-menu-label, .sub-menu-label {
            margin-bottom: 5px;  /* Adjust margin-bottom */
            font-size: 18px; /* Adjust font size */
            line-height: 1.5; /* Adjust line height */
            font-weight: 400; /* Adjust font weight */
            text-transform: none; /* Adjust text transform */
        }.sub-menu-label {margin-top: 30px;}
    </style>
    <div id="menu-dropdown">
        <label class="main-menu-label" for="main-menu">USA Results</label>
        <select id="main-menu">
            <option value=""><?php _e('Select State', 'text-domain'); ?></option>
            <?php
            foreach ($menu_items as $item) {
                if ($item->menu_item_parent == 0) { // Only show top-level menu items
                    $selected = $current_main_menu && $current_main_menu->ID == $item->ID ? ' selected' : '';
                    echo '<option value="' . esc_url($item->url) . '" data-id="' . esc_attr($item->ID) . '"' . $selected . '>' . esc_html($item->title) . '</option>';
                }
            }
            ?>
        </select>

        <label class="sub-menu-label" for="sub-menu"><?php _e('Select Lotto', 'text-domain'); ?></label>
        <select id="sub-menu">
            <option value=""><?php _e('Select Lotto', 'text-domain'); ?></option>
            <?php
            if ($current_main_menu) {
                foreach ($menu_items as $item) {
                    if ($item->menu_item_parent == $current_main_menu->ID) {
                        $selected = $current_sub_menu && $current_sub_menu->ID == $item->ID ? ' selected' : '';
                        echo '<option value="' . esc_url($item->url) . '"' . $selected . '>' . esc_html($item->title) . '</option>';
                    }
                }
            }
            ?>
        </select>
    </div>
    <script>
        jQuery(document).ready(function($) {
            function updateSubMenu(parentMenuId) {
                $('#sub-menu').empty(); // Clear existing options
                $('#sub-menu').append('<option value=""><?php _e('Select Lotto', 'text-domain'); ?></option>'); // Add default option
                if (parentMenuId) {
                    <?php
                    // Output the sub-menu options for the selected main menu item
                    foreach ($menu_items as $item) {
                        if ($item->menu_item_parent != 0) {
                            echo 'if (parentMenuId == ' . $item->menu_item_parent . ') {';
                            echo '$("#sub-menu").append("<option value=\'' . esc_url($item->url) . '\'>' . esc_html($item->title) . '</option>");';
                            echo '}';
                        }
                    }
                    ?>
                }
                // Select the current sub-menu item if it exists
                $('#sub-menu option').each(function() {
                    if ($(this).val() == '<?php echo esc_url($current_sub_menu ? $current_sub_menu->url : ''); ?>') {
                        $(this).attr('selected', 'selected');
                    }
                });
            }

            $('#main-menu').change(function() {
                var parentMenuId = $(this).find('option:selected').data('id');
                updateSubMenu(parentMenuId);
            });

            $('#sub-menu').change(function() {
                var postUrl = $(this).val();
                // Redirect only if a valid URL is selected and it's not the placeholder
                if (postUrl && postUrl !== '<?php echo esc_url($current_url); ?>') {
                    window.location.href = postUrl;
                }
            });

            // Automatically trigger the change event to load the correct sub-menu on page load
            var mainMenuId = $('#main-menu').find('option:selected').data('id');
            updateSubMenu(mainMenuId);
        });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('menu_dropdown', 'custom_menu_dropdown');