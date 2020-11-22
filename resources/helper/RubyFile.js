const rubyTemplate = ({ name, resolution, date_of_introduction }) => {
    return `{
        :device => '${name}-9.0-${resolution}', 
        :emulator => false, 
        :real_device => true, 
        :show_with_real => true, 
        :show_hard_buttons => false, 
        :display_name => '${name}', 
        :date_of_introduction => '${date_of_introduction}' 
    }`;
} 

module.exports = rubyTemplate;