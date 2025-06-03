import React, { useState } from 'react';
import Loading, { SkeletonLoading, CardSkeletonLoading, ButtonLoading, PageLoading } from './Loading';
import { PRIMARY, SUCCESS, WARNING, ERROR, INFO, TEXT, BACKGROUND } from '../constants/colors';

const LoadingDemo = () => {
    const [showPageLoading, setShowPageLoading] = useState(false);
    const [loadingStates, setLoadingStates] = useState({
        button1: false,
        button2: false,
        button3: false,
    });

    const handleButtonClick = (buttonId) => {
        setLoadingStates(prev => ({ ...prev, [buttonId]: true }));
        setTimeout(() => {
            setLoadingStates(prev => ({ ...prev, [buttonId]: false }));
        }, 3000);
    };

    const showPageLoadingDemo = () => {
        setShowPageLoading(true);
        setTimeout(() => {
            setShowPageLoading(false);
        }, 3000);
    };

    return (
        <div className="p-8 space-y-12" style={{ backgroundColor: BACKGROUND.NEUTRAL }}>
            <div>
                <h1 className="text-3xl font-bold mb-2" style={{ color: TEXT.PRIMARY }}>
                    Loading Components Demo
                </h1>
                <p className="text-lg" style={{ color: TEXT.SECONDARY }}>
                    Bộ sưu tập các component loading với màu sắc từ color system
                </p>
            </div>

            {/* Basic Loading Types */}
            <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                    1. Các kiểu Loading cơ bản
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[
                        { type: 'spinner', name: 'Spinner' },
                        { type: 'dots', name: 'Dots' },
                        { type: 'pulse', name: 'Pulse' },
                        { type: 'bars', name: 'Bars' },
                        { type: 'wave', name: 'Wave' },
                        { type: 'ring', name: 'Ring' },
                        { type: 'square', name: 'Square' },
                        { type: 'heart', name: 'Heart' },
                        { type: 'medical', name: 'Medical' }
                    ].map((item) => (
                        <div key={item.type} className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <Loading type={item.type} size="medium" color="primary" />
                            <p className="mt-3 text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                {item.name}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Different Colors */}
            <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                    2. Màu sắc khác nhau
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[
                        { color: 'primary', name: 'Primary' },
                        { color: 'secondary', name: 'Secondary' },
                        { color: 'success', name: 'Success' },
                        { color: 'warning', name: 'Warning' },
                        { color: 'error', name: 'Error' },
                        { color: 'info', name: 'Info' }
                    ].map((item) => (
                        <div key={item.color} className="bg-white p-4 rounded-lg shadow-sm text-center">
                            <Loading type="spinner" size="medium" color={item.color} />
                            <p className="mt-2 text-xs font-medium" style={{ color: TEXT.SECONDARY }}>
                                {item.name}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Different Sizes */}
            <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                    3. Kích thước khác nhau
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                        { size: 'small', name: 'Small' },
                        { size: 'medium', name: 'Medium' },
                        { size: 'large', name: 'Large' },
                        { size: 'xl', name: 'Extra Large' }
                    ].map((item) => (
                        <div key={item.size} className="bg-white p-6 rounded-xl shadow-sm text-center">
                            <Loading type="medical" size={item.size} color="primary" />
                            <p className="mt-3 text-sm font-medium" style={{ color: TEXT.SECONDARY }}>
                                {item.name}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* With Text */}
            <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                    4. Loading với text
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <Loading
                            type="medical"
                            size="large"
                            color="primary"
                            text="Đang tải dữ liệu..."
                        />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <Loading
                            type="dots"
                            size="medium"
                            color="success"
                            text="Đang xử lý..."
                        />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <Loading
                            type="heart"
                            size="large"
                            color="error"
                            text="Đang kiểm tra sức khỏe..."
                        />
                    </div>
                </div>
            </section>

            {/* Skeleton Loading */}
            <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                    5. Skeleton Loading
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                            Text Skeleton
                        </h3>
                        <SkeletonLoading lines={4} height="h-4" />
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm">
                        <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                            Card Skeleton
                        </h3>
                        <CardSkeletonLoading />
                    </div>
                </div>
            </section>

            {/* Button Loading */}
            <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                    6. Button Loading
                </h2>
                <div className="flex flex-wrap gap-4">
                    <button
                        onClick={() => handleButtonClick('button1')}
                        disabled={loadingStates.button1}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
                        style={{ backgroundColor: PRIMARY[500] }}
                    >
                        {loadingStates.button1 && <ButtonLoading size="small" color="primary" />}
                        {loadingStates.button1 ? 'Đang xử lý...' : 'Xác nhận'}
                    </button>

                    <button
                        onClick={() => handleButtonClick('button2')}
                        disabled={loadingStates.button2}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-70"
                        style={{ backgroundColor: SUCCESS[500] }}
                    >
                        {loadingStates.button2 && <ButtonLoading size="small" color="success" />}
                        {loadingStates.button2 ? 'Đang lưu...' : 'Lưu'}
                    </button>

                    <button
                        onClick={() => handleButtonClick('button3')}
                        disabled={loadingStates.button3}
                        className="flex items-center gap-2 px-6 py-3 rounded-lg border font-medium hover:bg-gray-50 transition-colors disabled:opacity-70"
                        style={{ borderColor: PRIMARY[300], color: PRIMARY[600] }}
                    >
                        {loadingStates.button3 && <ButtonLoading size="small" color="primary" />}
                        {loadingStates.button3 ? 'Đang tải...' : 'Tải xuống'}
                    </button>
                </div>
            </section>

            {/* Page Loading */}
            <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                    7. Page Loading (Full Screen)
                </h2>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="mb-4" style={{ color: TEXT.SECONDARY }}>
                        Click button để xem page loading full screen:
                    </p>
                    <button
                        onClick={showPageLoadingDemo}
                        className="px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: PRIMARY[500] }}
                    >
                        Hiển thị Page Loading
                    </button>
                </div>
            </section>

            {/* Usage Examples */}
            <section>
                <h2 className="text-2xl font-semibold mb-6" style={{ color: TEXT.PRIMARY }}>
                    8. Cách sử dụng
                </h2>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold mb-4" style={{ color: TEXT.PRIMARY }}>
                        Import và sử dụng:
                    </h3>
                    <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        {`// Import components
import Loading, { 
    SkeletonLoading, 
    CardSkeletonLoading, 
    ButtonLoading, 
    PageLoading 
} from './components/Loading';

// Basic usage
<Loading type="spinner" size="medium" color="primary" />

// With text
<Loading 
    type="medical" 
    size="large" 
    color="primary" 
    text="Đang tải..." 
/>

// Full screen
<Loading 
    type="medical" 
    size="large" 
    color="primary" 
    text="Đang tải..."
    fullScreen={true}
/>

// In button
<button disabled={loading}>
    {loading && <ButtonLoading size="small" />}
    {loading ? 'Đang xử lý...' : 'Submit'}
</button>

// Skeleton loading
<SkeletonLoading lines={3} height="h-4" />

// Card skeleton
<CardSkeletonLoading />

// Page loading
<PageLoading message="Đang tải dữ liệu..." />`}
                    </pre>
                </div>
            </section>

            {showPageLoading && <PageLoading message="Demo Page Loading - sẽ tự động đóng sau 3 giây" />}
        </div>
    );
};

export default LoadingDemo; 