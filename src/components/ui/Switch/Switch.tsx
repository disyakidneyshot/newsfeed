import React from 'react'
import { Background, Toggler, SwitchIcon } from './styledComps'

interface ISwitchProps {
	value: boolean
	onChange: (value: boolean) => void
}

interface ISwitchComposition {
	On: React.FC
	Off: React.FC
}

type SwitchState = boolean

const SwitchContext = React.createContext<SwitchState>(false)

export const Switch: React.FC<ISwitchProps> & ISwitchComposition = ({
	value,
	onChange,
	children,
}): JSX.Element => {
	return (
		<Background onClick={() => onChange(!value)}>
			<Toggler state={value} />
			<SwitchContext.Provider value={value}>{children}</SwitchContext.Provider>
		</Background>
	)
}

Switch.defaultProps = {
	value: false,
}

const useSwitchContext = () => {
	const ctx = React.useContext(SwitchContext)
	if (ctx === undefined) {
		throw new Error(
			'Switch compound components cannot be used outside Switch component'
		)
	}
	return ctx
}

const On: React.FC = ({ children }): JSX.Element | null => {
	const state = useSwitchContext()
	return state ? <SwitchIcon side='right'>{children}</SwitchIcon> : null
}

const Off: React.FC = ({ children }): JSX.Element | null => {
	const state = useSwitchContext()
	return state ? null : <SwitchIcon side='left'>{children}</SwitchIcon>
}

Switch.On = On
Switch.Off = Off
