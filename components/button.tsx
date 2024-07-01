import { Button as ChakraButton, ButtonGroup } from '@chakra-ui/react'


export const Button = ({children, ...rest}) => <ChakraButton {...rest}>{children}</ChakraButton>