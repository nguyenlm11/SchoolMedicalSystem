import React from 'react';
import { PRIMARY, SECONDARY, SUCCESS, WARNING, ERROR, INFO, TEXT, BACKGROUND } from '../constants/colors';

const Loading = ({ type = 'spinner', size = 'medium', color = 'primary', text = '', overlay = false, fullScreen = false }) => {
    const getColor = (colorType) => {
        switch (colorType) {
            case 'primary': return PRIMARY[500];
            case 'secondary': return SECONDARY[500];
            case 'success': return SUCCESS[500];
            case 'warning': return WARNING[500];
            case 'error': return ERROR[500];
            case 'info': return INFO[500];
            default: return PRIMARY[500];
        }
    };

    const getSizeClasses = (sizeType) => {
        switch (sizeType) {
            case 'small': return {
                spinner: 'h-4 w-4 border-2',
                container: 'p-2',
                text: 'text-xs',
                dots: 'h-2 w-2',
                bars: 'h-6'
            };
            case 'medium': return {
                spinner: 'h-8 w-8 border-2',
                container: 'p-4',
                text: 'text-sm',
                dots: 'h-3 w-3',
                bars: 'h-8'
            };
            case 'large': return {
                spinner: 'h-12 w-12 border-4',
                container: 'p-6',
                text: 'text-base',
                dots: 'h-4 w-4',
                bars: 'h-10'
            };
            case 'xl': return {
                spinner: 'h-16 w-16 border-4',
                container: 'p-8',
                text: 'text-lg',
                dots: 'h-5 w-5',
                bars: 'h-12'
            };
            default: return getSizeClasses('medium');
        }
    };

    const mainColor = getColor(color);
    const sizeClasses = getSizeClasses(size);

    const SpinnerLoading = () => (
        <div
            className={`animate-spin rounded-full border-t-transparent border-solid ${sizeClasses.spinner}`}
            style={{
                borderColor: mainColor,
                borderTopColor: 'transparent'
            }}
        />
    );

    const DotsLoading = () => (
        <div className="flex space-x-1">
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={`rounded-full animate-bounce ${sizeClasses.dots}`}
                    style={{
                        backgroundColor: mainColor,
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            ))}
        </div>
    );

    const PulseLoading = () => (
        <div className="flex space-x-1">
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={`rounded-full animate-pulse ${sizeClasses.dots}`}
                    style={{
                        backgroundColor: mainColor,
                        animationDelay: `${i * 0.15}s`
                    }}
                />
            ))}
        </div>
    );

    const BarsLoading = () => (
        <div className="flex items-end space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className={`w-1 bg-current animate-bounce ${sizeClasses.bars}`}
                    style={{
                        backgroundColor: mainColor,
                        animationDelay: `${i * 0.1}s`
                    }}
                />
            ))}
        </div>
    );

    const WaveLoading = () => (
        <div className="flex items-center space-x-1">
            {[0, 1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="w-1 bg-current animate-pulse"
                    style={{
                        backgroundColor: mainColor,
                        height: size === 'small' ? '16px' : size === 'large' ? '32px' : size === 'xl' ? '40px' : '24px',
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1s'
                    }}
                />
            ))}
        </div>
    );

    const RingLoading = () => (
        <div className="relative">
            <div
                className={`rounded-full border-4 border-opacity-25 ${sizeClasses.spinner.replace('border-2', 'border-4')}`}
                style={{ borderColor: mainColor }}
            />
            <div
                className={`absolute top-0 left-0 rounded-full border-4 border-transparent border-t-current animate-spin ${sizeClasses.spinner.replace('border-2', 'border-4')}`}
                style={{ borderTopColor: mainColor }}
            />
        </div>
    );

    const SquareLoading = () => (
        <div
            className={`animate-spin ${sizeClasses.spinner.replace('rounded-full', 'rounded-sm')}`}
            style={{ backgroundColor: mainColor }}
        />
    );

    const HeartLoading = () => (
        <div className="flex items-center">
            <div
                className={`animate-pulse ${sizeClasses.spinner} relative`}
                style={{ color: mainColor }}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
            </div>
        </div>
    );

    const MedicalLoading = () => (
        <div className="relative">
            <div
                className={`animate-spin ${sizeClasses.spinner}`}
                style={{ color: mainColor }}
            >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                    <path d="M19 8h-2V6c0-1.1-.9-2-2-2H9c-1.1 0-2 .9-2 2v2H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h2v2c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2v-2h2c1.1 0 2-.9 2-2v-6c0-1.1-.9-2-2-2zm-8 9h-2v-4H5v-2h4V7h2v4h4v2h-4v4z" />
                </svg>
            </div>
        </div>
    );

    const renderLoading = () => {
        switch (type) {
            case 'spinner': return <SpinnerLoading />;
            case 'dots': return <DotsLoading />;
            case 'pulse': return <PulseLoading />;
            case 'bars': return <BarsLoading />;
            case 'wave': return <WaveLoading />;
            case 'ring': return <RingLoading />;
            case 'square': return <SquareLoading />;
            case 'heart': return <HeartLoading />;
            case 'medical': return <MedicalLoading />;
            default: return <SpinnerLoading />;
        }
    };

    // Container styles
    const containerClasses = `
        flex flex-col items-center justify-center
        ${sizeClasses.container}
        ${fullScreen ? 'fixed inset-0 z-50' : ''}
        ${overlay ? 'bg-black bg-opacity-50' : ''}
    `;

    const containerStyle = {
        backgroundColor: overlay ? 'rgba(0, 0, 0, 0.5)' : fullScreen ? BACKGROUND.DEFAULT : 'transparent'
    };

    return (
        <div className={containerClasses} style={containerStyle}>
            <div className="flex flex-col items-center space-y-3">
                {renderLoading()}
                {text && (
                    <p
                        className={`font-medium ${sizeClasses.text} text-center`}
                        style={{ color: overlay ? TEXT.INVERSE : TEXT.SECONDARY }}
                    >
                        {text}
                    </p>
                )}
            </div>
        </div>
    );
};

export const SkeletonLoading = ({
    lines = 3,
    height = 'h-4',
    className = '',
    animate = true
}) => (
    <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, index) => (
            <div
                key={index}
                className={`
                    ${height} 
                    rounded-md 
                    ${animate ? 'animate-pulse' : ''}
                `}
                style={{
                    backgroundColor: PRIMARY[100],
                    width: index === lines - 1 ? '75%' : '100%'
                }}
            />
        ))}
    </div>
);

export const CardSkeletonLoading = ({ className = '' }) => (
    <div className={`bg-white rounded-xl shadow-sm p-6 ${className}`}>
        <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-4">
                <div
                    className="h-12 w-12 rounded-full"
                    style={{ backgroundColor: PRIMARY[100] }}
                />
                <div className="flex-1 space-y-2">
                    <div
                        className="h-4 rounded w-3/4"
                        style={{ backgroundColor: PRIMARY[100] }}
                    />
                    <div
                        className="h-3 rounded w-1/2"
                        style={{ backgroundColor: PRIMARY[50] }}
                    />
                </div>
            </div>
            <div className="space-y-3">
                <div
                    className="h-4 rounded"
                    style={{ backgroundColor: PRIMARY[100] }}
                />
                <div
                    className="h-4 rounded w-5/6"
                    style={{ backgroundColor: PRIMARY[100] }}
                />
                <div
                    className="h-4 rounded w-4/6"
                    style={{ backgroundColor: PRIMARY[50] }}
                />
            </div>
        </div>
    </div>
);

export const ButtonLoading = ({
    size = 'medium',
    color = 'primary',
    className = ''
}) => {
    const mainColor = color === 'primary' ? PRIMARY[500] :
        color === 'secondary' ? SECONDARY[500] :
            color === 'success' ? SUCCESS[500] :
                color === 'warning' ? WARNING[500] :
                    color === 'error' ? ERROR[500] : PRIMARY[500];

    const sizeClass = size === 'small' ? 'h-3 w-3' :
        size === 'large' ? 'h-5 w-5' : 'h-4 w-4';

    return (
        <div
            className={`animate-spin rounded-full border-2 border-t-transparent ${sizeClass} ${className}`}
            style={{
                borderColor: 'currentColor',
                borderTopColor: 'transparent'
            }}
        />
    );
};

export const PageLoading = ({ message = "Đang tải..." }) => (
    <Loading
        type="medical"
        size="large"
        color="primary"
        text={message}
        fullScreen={true}
        overlay={false}
    />
);

export default Loading; 