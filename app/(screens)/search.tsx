import React, { useState, useCallback, useMemo } from "react";
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from "react-native";
import { searchFood } from "../../backend/api";

interface FoodThumbnail {
    food_id: string;
    food_name: string;
    brand_name?: string;
    food_description: string;
}

const getCalories = (description: string): string => {
    const calorieMatch = description.match(/Calories: (\d+)kcal/);
    return calorieMatch ? calorieMatch[1] : "N/A";
};

const FoodResult = React.memo(({ item, onPress }: { item: FoodThumbnail; onPress: () => void }) => (
    <Pressable
        className="mx-6 my-2 bg-gray-100 rounded-2xl p-4"
        onPress={onPress}>
        {({ pressed }) => (
            <View className="flex-row">
                <View className="flex-1 pr-2">
                    <Text className={`text-lg flex-wrap ${pressed ? 'text-gray-600' : 'text-black'}`}>
                        {item.food_name}
                    </Text>
                    <Text className={`text-sm ${pressed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {item.brand_name || "Generic"}
                    </Text>
                </View>
                <View className="justify-center">
                    <Text className={`text-sm ${pressed ? 'text-gray-400' : 'text-gray-600'}`}>
                        {getCalories(item.food_description)} cals
                    </Text>
                </View>
            </View>
        )}
    </Pressable>
));

const Search = () => {
    const [query, setQuery] = useState<string>("");
    const [searchResults, setSearchResults] = useState<FoodThumbnail[]>([]);
    const [page, setPage] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(true);

    const handleSearch = useCallback(async (resetResults: boolean = true) => {
        if (loading || (resetResults && query.trim() === "")) return;

        setLoading(true);
        try {
            const currentPage = resetResults ? 0 : page;
            const results = await searchFood(query, currentPage + 1);
            const foods = results.foods.food || [];

            setSearchResults(prevResults => resetResults ? foods : [...prevResults, ...foods]);
            setPage(currentPage + 1);
            setHasMore(foods.length > 0);
        } catch (error) {
            console.error("Error searching for food:", error);
        } finally {
            setLoading(false);
        }
    }, [query, page, loading]);

    const handleLoadMore = useCallback(() => {
        if (hasMore && !loading) {
            handleSearch(false);
        }
    }, [hasMore, loading, handleSearch]);

    const renderFoodItem = useCallback(({ item }: { item: FoodThumbnail }) => (
        <FoodResult 
            item={item} 
            onPress={() => console.log("Selected food:", item.food_name)}
        />
    ), []);

    const keyExtractor = useCallback((item: FoodThumbnail) => item.food_id, []);

    const renderFooter = useMemo(() => {
        if (!loading) return null;
        return (
            <View className="py-4">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }, [loading]);

    return (
        <View className="flex-1 bg-white mt-10">
            <View className="p-4">
                <TextInput
                    className="my-1 bg-gray-200 rounded-xl p-2 px-4"
                    placeholder="Search for food..."
                    value={query}
                    onChangeText={setQuery}
                    onSubmitEditing={() => handleSearch()}
                />
            </View>
            <FlatList
                data={searchResults}
                renderItem={renderFoodItem}
                keyExtractor={keyExtractor}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={renderFooter}
                removeClippedSubviews={true}
                maxToRenderPerBatch={10}
                updateCellsBatchingPeriod={50}
                initialNumToRender={20}
                windowSize={21}
            />
        </View>
    );
};

export default Search;