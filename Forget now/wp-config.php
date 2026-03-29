<?php
define( 'WP_CACHE', true );

/** The name of the database for WordPress */

define( 'DB_NAME', 'u123444594_LPaYm' );
/** Database username */
define( 'DB_USER', 'u123444594_sQ14Y' );
/** Database password */
define( 'DB_PASSWORD', 'ZEhVb8cynC' );
/** Database hostname */
define( 'DB_HOST', '127.0.0.1' );
/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );
/** The database collate type. Don't change this if in doubt. */

define( 'DB_COLLATE', '' );
define( 'AUTH_KEY',          '~?A3Uen[D(-<6YyT$|;(jDFdK{7d.pwZ|6YLMCnl|g^qw9u%tzuppcY07e%mvT7s' );
define( 'SECURE_AUTH_KEY',   'u]OF!F7O[wxU!4=vJfl9*3{aMt 3|Jru@7H*lH2[lh,>PbG#D(lTUq]GCf~+:}(u' );
define( 'LOGGED_IN_KEY',     'WP<yZn6_-TM_JDgv( cF^#xGO8eLLo#}O%Bc4~+:/P(T/?*pllWlQ(/-:,&6v`ge' );
define( 'NONCE_KEY',         'bfcyAU:3dr:5k]2ApE2F[*;jZl$C(<6FsfPIj9=bnOI~(7`drS*cHpb;N(!Nn3BD' );
define( 'AUTH_SALT',         'Et/WgU~-Q<zSkPd$`fi0oQQ:o+O6#{Fl+zI$P~ay&UqpEDfK.Wv9N?F%M#DJ`vbv' );
define( 'SECURE_AUTH_SALT',  '6 MBvVK0R6]`LE_ =%;EwSE<X;wrwS?ZAtX8-_;w {!wgVA_#/WykqJ;F=+ET|KC' );
define( 'LOGGED_IN_SALT',    'iS-~VfF*!Muhx%Ne,2%V?pOt13YH-x 8#?;=x4l*V-t;<Uf1.C! tVw#=>9fZ:&I' );
define( 'NONCE_SALT',        'GG2YN<U2}DG4E]>NXA8*:]eBTvwA/X+Wv*dRJa%cHm/^K;KV<K~wfe$gXHkb5F7 ' );
define( 'WP_CACHE_KEY_SALT', '~p_/);{+07BQO 2<~oo;_zM,]KKC||mF,%o)vho~]K:YOZ!IwYHzp8*^=dlC_8fc' );
$table_prefix = 'wp_';
if ( ! defined( 'WP_DEBUG' ) ) {
define( 'WP_DEBUG', false );
}
define( 'FS_METHOD', 'direct' );
define( 'COOKIEHASH', 'b8f6ce6fdba8745633ef7f2671ee35a8' );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
/* That's all, stop editing! Happy publishing. */
/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
define( 'ABSPATH', __DIR__ . '/' );
}
/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';