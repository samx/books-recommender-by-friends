export class SocialNetworkQueries {

    constructor({ fetchCurrentUser }) {
        this.fetchCurrentUser = fetchCurrentUser;
    }

    async findPotentialLikes({ minimalScore } = {}) {

        function getObjectBooksWithLikes(friends) {
            const booksAndLikes = {}

            friends.forEach(friend => {                
                const list = (friend.likes && friend.likes.books) ? friend.likes.books : [];

                list.forEach((bookName)=>{                
                    if( booksAndLikes[bookName]) // found then increment likes
                    booksAndLikes[bookName]++;                 
                    else
                    booksAndLikes[bookName] = 1;                 
                })
            });
            return booksAndLikes
        }

        function getListBooksRecommendedByScore(friendsBooksAndLikes, friendsTotal, userLikesBooksList, minimalScore){
            
            const booksRecommendedList = [];

            //Does book meet threshold (minimalScore) check
            for (const bookName in friendsBooksAndLikes) { 
                
                if(userLikesBooksList.indexOf(bookName) > -1) continue;   //skip if user already likes the book
                
                const bookLikesTotal = friendsBooksAndLikes[bookName];
                const doesPassMinimalScore = bookLikesTotal / friendsTotal >= minimalScore

                if( doesPassMinimalScore === true)
                    booksRecommendedList.push({bookName:bookName, likes:bookLikesTotal})
                            
            }
            return booksRecommendedList;
        }

        try{
            const user = await this.fetchCurrentUser();            
            const listUserLikesBooks = (user.likes && user.likes.books)? user.likes.books: [] ;

            const listFriends = (user.friends )? user.friends : [];  

            const objectFriendsBooksAndLikes = getObjectBooksWithLikes(listFriends);

            const listBooksRecommendedByFriends = getListBooksRecommendedByScore(objectFriendsBooksAndLikes, listFriends.length, listUserLikesBooks, minimalScore);

            //first sort by alphabetical order    
            listBooksRecommendedByFriends.sort((a,b) => a.bookName.localeCompare(b.bookName, "en", { sensitivity: "base" }));

            //second sort by likes couunt
            listBooksRecommendedByFriends.sort((a,b) => b.likes - a.likes);

            const books = listBooksRecommendedByFriends.map(({bookName})=> bookName)
        
            return Promise.resolve({books});
        }catch(e){
            return Promise.resolve({books:[]});
        }
    }
}