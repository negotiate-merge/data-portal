''' Downlink messages - http://wiki.dragino.com/xwiki/bin/view/Main/User%20Manual%20for%20LoRaWAN%20End%20Nodes/LT-22222-L/ '''
r2On = bytes([0x03, 0x11, 0x01])                    # Close RO2, value of 0x11 leaves that relay state unchanged
r2Off = bytes([0x03, 0x11, 0x00])                   # Open RO2
set_uplink_int = bytes([0x01, 0x00, 0x00, 0x00])    # Up to 3 bytes of interval time between uplinks
poll_uplink = bytes([0x08, 0xFF])                   # Ask for an uplink
set_mode_1 = bytes([0x0A, 0x01])                    # Set work mode to 01 - default

''' To set both inputs to trigger rising and falling send the following sequences:
    enable_trigger_mode
    enable_DI1_DI2_trigger
    set_DI1_trigger_all
    set_DI2_trigger_all
'''

enable_trigger_mode = bytes([0x0A, 0x06, 0x01])             # Adds/enables mode 6
disable_trigger_mode = bytes([0x0A, 0x06, 0x00])            # Disables mode 6
poll_trigger_settings = bytes([0xAB, 0x06])                 # Poll an uplink for mode 6 settings
enable_DI1_DI2_trigger = bytes([0xAA, 0x02, 0x01, 0x01])    # Enables trigger on DI1 & DI2

# Set DI1 or DI2 as trigger [command, input(pin), mode, (timebyte, timebyte)]
# modes (0 = falling edge, 1 = rising edge, 2 = rising and falling)
set_DI1_trigger_falling = bytes([0x09, 0x01, 0x00, 0x00, 0x64])     # Set trigger on DI1 for falling edge when signal is > 100ms
set_DI1_trigger_rising = bytes([0x09, 0x01, 0x01, 0x00, 0x64])      # Set trigger on DI1 for rising edge when signal is > 100ms
set_DI1_trigger_all = bytes([0x09, 0x01, 0x02, 0x00, 0x64])         # Set trigger on DI1 for rising and falling edges at 100ms

set_DI2_trigger_falling = bytes([0x09, 0x02, 0x00, 0x00, 0x64])     # Set trigger on DI1 for falling edge when signal is > 100ms
set_DI2_trigger_rising = bytes([0x09, 0x02, 0x01, 0x00, 0x64])      # Set trigger on DI1 for rising edge when signal is > 100ms
set_DI2_trigger_all = bytes([0x09, 0x02, 0x02, 0x00, 0x64])         # Set trigger on DI1 for rising and falling edges at 100ms

''' Additional downlink messages can be found here:
    http://wiki.dragino.com/xwiki/bin/view/Main/End%20Device%20AT%20Commands%20and%20Downlink%20Command/#H2.HowtouseATCommandsorDownlinkcommand
'''
get_confirmation_mode = bytes([0x05, 0x00])							# Get's confirmation settings among other information.                           

# Graveyard - these don't work
# set_confirmation_mode = bytes([0x05, 0x01])							# Set's end node to use confirmation mode.