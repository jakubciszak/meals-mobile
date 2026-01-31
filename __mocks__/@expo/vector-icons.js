const React = require('react');
const { Text } = require('react-native');

const createIconSet = () => {
  const IconComponent = ({ name, size, color, ...props }) =>
    React.createElement(Text, { ...props }, name);
  return IconComponent;
};

module.exports = {
  Ionicons: createIconSet(),
  MaterialIcons: createIconSet(),
  FontAwesome: createIconSet(),
  createIconSet,
};
